'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
// Sessão de 1 ano para garantir persistência máxima
const SESSION_DURATION = 365 * 24 * 60 * 60 * 1000;

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

  // Track if we've received the first auth state from Firebase
  const hasReceivedAuthState = useRef(false);
  // Track if we have stored auth data (indicates we should wait for Firebase to restore)
  const hasStoredData = useRef(false);

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
      rememberMe: true, // SEMPRE true para máxima persistência
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      console.log('[Auth] Dados salvos no localStorage');
    } catch (error) {
      console.error('[Auth] Erro ao salvar dados:', error);
    }
  }, []);

  // Função para carregar dados de autenticação do localStorage
  const loadAuthData = useCallback((): StoredAuthData | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) {
        console.log('[Auth] Nenhum dado armazenado');
        return null;
      }

      const authData: StoredAuthData = JSON.parse(stored);
      console.log('[Auth] Dados carregados do localStorage:', authData.user.email);

      // Verificar expiração apenas se não for rememberMe
      if (!authData.rememberMe) {
        const isExpired = Date.now() - authData.timestamp > SESSION_DURATION;
        if (isExpired) {
          console.log('[Auth] Sessão expirada');
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return null;
        }
      }

      // Atualizar timestamp para estender sessão
      authData.timestamp = Date.now();
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

      return authData;
    } catch (error) {
      console.error('[Auth] Erro ao carregar dados:', error);
      return null;
    }
  }, []);

  // Função para limpar dados de autenticação
  const clearAuthData = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      console.log('[Auth] Dados limpos do localStorage');
    } catch (error) {
      console.error('[Auth] Erro ao limpar dados:', error);
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
      saveAuthData(user, true);

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

      if (credentials.displayName) {
        await updateProfile(user, {
          displayName: credentials.displayName,
        });
      }

      saveAuthData(user, true);

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

  // Verificar se temos dados armazenados no início
  useEffect(() => {
    const storedData = loadAuthData();
    hasStoredData.current = !!storedData;
    console.log('[Auth] Tem dados armazenados:', hasStoredData.current);
  }, [loadAuthData]);

  // Listener para mudanças de estado de autenticação do Firebase
  useEffect(() => {
    console.log('[Auth] Inicializando listener do Firebase');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[Auth] onAuthStateChanged:', user?.email || 'null');

      if (user) {
        // Usuário autenticado
        hasReceivedAuthState.current = true;
        saveAuthData(user, true);

        setAuthState({
          user,
          loading: false,
          error: null,
        });
      } else {
        // Firebase retornou null
        // Se temos dados armazenados e é a primeira vez, esperar mais tempo
        if (hasStoredData.current && !hasReceivedAuthState.current) {
          console.log('[Auth] Firebase retornou null mas temos dados armazenados, aguardando...');

          // Aguardar um pouco mais para o Firebase restaurar a sessão
          setTimeout(() => {
            // Verificar novamente
            if (!auth.currentUser) {
              console.log('[Auth] Firebase não restaurou a sessão após espera');
              hasReceivedAuthState.current = true;
              clearAuthData();
              setAuthState({
                user: null,
                loading: false,
                error: null,
              });
            }
          }, 3000); // Esperar 3 segundos

          // Não mudar o estado ainda - manter loading
          return;
        }

        hasReceivedAuthState.current = true;

        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, [saveAuthData, clearAuthData]);

  return {
    ...authState,
    login,
    signup,
    logout,
    clearAuthData,
  };
};
