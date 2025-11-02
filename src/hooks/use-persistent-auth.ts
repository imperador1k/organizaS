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
// Aumentado de 30 dias para 90 dias para manter a sessão ativa por mais tempo
const SESSION_DURATION = 90 * 24 * 60 * 60 * 1000; // 90 dias em millisegundos

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
      
      // Verificar se a sessão ainda é válida
      const isExpired = Date.now() - authData.timestamp > SESSION_DURATION;
      if (isExpired && !authData.rememberMe) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
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
      if (storedAuthData && !storedAuthData.rememberMe) {
        const isExpired = Date.now() - storedAuthData.timestamp > SESSION_DURATION;
        if (isExpired) {
          logout();
        }
      }
    };

    // Verificar a cada 30 minutos (aumentado de 5 minutos)
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
