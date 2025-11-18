'use client';

import { useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';

// Aumentado de 6 horas para 1 hora para manter a sessão ativa por mais tempo
const TOKEN_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hora em milissegundos

export const useTokenRefresh = (user: User | null) => {

  const refreshToken = useCallback(async (currentUser: User) => {
    try {
      // Forçar renovação do token
      const token = await currentUser.getIdToken(true);
      console.log('Token renovado com sucesso');
      return token;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Renovar token imediatamente se necessário
    const checkAndRefreshToken = async () => {
      try {
        const token = await user.getIdToken();
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const tokenExpiry = decodedToken.exp;
        
        // Se o token expira em menos de 1 hora, renovar
        if (tokenExpiry - currentTime < 3600) {
          await refreshToken(user);
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
      }
    };

    // Verificar token na inicialização
    checkAndRefreshToken();

    // Configurar renovação automática a cada 1 hora
    const interval = setInterval(() => {
      if (user) {
        refreshToken(user);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user, refreshToken]);

  // Adicionar listener para eventos de visibilidade da página
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Quando a página se torna visível, verificar e renovar o token se necessário
        try {
          const token = await user.getIdToken();
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const tokenExpiry = decodedToken.exp;
          
          // Se o token expira em menos de 30 minutos, renovar
          if (tokenExpiry - currentTime < 1800) {
            await refreshToken(user);
          }
        } catch (error) {
          console.error('Erro ao verificar token ao voltar à página:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [user, refreshToken]);

  return { refreshToken };
};