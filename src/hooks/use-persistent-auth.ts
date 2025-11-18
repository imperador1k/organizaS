'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  displayName?: string;
}

const AUTH_STORAGE_KEY = 'organizas_auth_data';
// Aumentado de 90 dias para 180 dias para manter a sessão ativa por mais tempo
const SESSION_DURATION = 180 * 24 * 60 * 60 * 1000; // 180 dias em millisegundos (aprox. 6 meses)

interface StoredAuthData {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  timestamp: number;
  rememberMe: boolean;
}

export const usePersistentAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Função para salvar dados de autenticação no localStorage
  const saveAuthData = useCallback((user: User, rememberMe: boolean = true) => {
    if (typeof window === 'undefined') return;
    
    const authData: StoredAuthData = {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      timestamp: Date.now(),
      rememberMe,
    };
    
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Erro ao salvar dados de autenticação:', error);
    }
  }, []);

  // Função para carregar dados de autenticação do localStorage
  const loadAuthData = useCallback((): StoredAuthData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      
      const authData: StoredAuthData = JSON.parse(stored);
      
      // Se rememberMe for true, nunca expirar a sessão
      if (authData.rememberMe) {
        // Mesmo assim, verificar se o token do Firebase ainda é válido
        if (auth.currentUser) {
          return authData;
        } else {
          // Se o usuário não está mais autenticado no Firebase, limpar os dados
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return null;
        }
      }
      
      // Para usuários sem rememberMe, verificar expiração normal
      const isExpired = Date.now() - authData.timestamp > SESSION_DURATION;
      if (isExpired) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      
      // Se a sessão estiver próxima de expirar (menos de 30 dias restantes), estender automaticamente
      const daysRemaining = (SESSION_DURATION - (Date.now() - authData.timestamp)) / (24 * 60 * 60 * 1000);
      if (daysRemaining < 30) {
        // Estender a sessão por mais 180 dias
        authData.timestamp = Date.now();
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      }
      
      return authData;
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }, []);

  // Função para limpar dados de autenticação
  const clearAuthData = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  }, []);

  // Função de login
  const login = useCallback(async (credentials: LoginCredentials, rememberMe: boolean = true) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const user = userCredential.user;
      saveAuthData(user, rememberMe);
      
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      
      return { success: true, user };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    }
  }, [saveAuthData]);

  // Função de registro
  const signup = useCallback(async (credentials: SignupCredentials, rememberMe: boolean = true) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const user = userCredential.user;
      
      // Atualizar perfil se displayName foi fornecido
      if (credentials.displayName) {
        await updateProfile(user, {
          displayName: credentials.displayName,
        });
      }
      
      saveAuthData(user, rememberMe);
      
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      
      return { success: true, user };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar conta';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    }
  }, [saveAuthData]);

  // Função de logout
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      await firebaseSignOut(auth);
      clearAuthData();
      
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer logout';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    }
  }, [clearAuthData]);

  // Verificar autenticação persistente na inicialização
  useEffect(() => {
    const checkPersistentAuth = async () => {
      const storedAuthData = loadAuthData();
      
      if (storedAuthData) {
        // Se temos dados armazenados, verificar se o usuário ainda está autenticado no Firebase
        if (auth.currentUser && auth.currentUser.uid === storedAuthData.user.uid) {
          setAuthState({
            user: auth.currentUser,
            loading: false,
            error: null,
          });
          return;
        }
      }
      
      // Se não há dados armazenados ou usuário não está autenticado, aguardar o Firebase
      setAuthState(prev => ({ ...prev, loading: false }));
    };

    checkPersistentAuth();
  }, [loadAuthData]);

  // Listener para mudanças de estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuário autenticado - salvar dados se necessário
        const storedAuthData = loadAuthData();
        if (!storedAuthData || storedAuthData.user.uid !== user.uid) {
          // Se não há dados armazenados, usar rememberMe = true por padrão
          saveAuthData(user, true);
        }
        
        setAuthState({
          user,
          loading: false,
          error: null,
        });
      } else {
        // Usuário não autenticado - limpar dados se necessário
        const storedAuthData = loadAuthData();
        if (storedAuthData) {
          clearAuthData();
        }
        
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, [loadAuthData, saveAuthData, clearAuthData]);

  // Verificar periodicamente se a sessão ainda é válida
  useEffect(() => {
    const checkSessionValidity = () => {
      const storedAuthData = loadAuthData();
      if (storedAuthData) {
        // Sempre renovar o token se o usuário estiver logado
        if (auth.currentUser) {
          // Atualizar o timestamp para estender a sessão
          storedAuthData.timestamp = Date.now();
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedAuthData));
          } catch (error) {
            console.error('Erro ao atualizar timestamp da sessão:', error);
          }
        } else if (!storedAuthData.rememberMe) {
          // Apenas fazer logout se rememberMe for false e a sessão expirou
          const isExpired = Date.now() - storedAuthData.timestamp > SESSION_DURATION;
          if (isExpired) {
            logout();
          }
        }
        // Se rememberMe for true, nunca fazer logout automaticamente
      }
    };

    // Verificar a cada 30 minutos
    const interval = setInterval(checkSessionValidity, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadAuthData, logout]);

  return {
    ...authState,
    login,
    signup,
    logout,
    clearAuthData,
  };
};
