'use client';

import { useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';

// Aumentado de 30 minutos para 6 horas para manter a sessão ativa por mais tempo
const TOKEN_REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 horas em milissegundos

export const useTokenRefresh = (user: User | null) => {

  const refreshToken = useCallback(async (currentUser: User) => {
    try {
      // Forçar renovação do token
      await currentUser.getIdToken(true);
      console.log('Token renovado com sucesso');
    } catch (error) {
      console.error('Erro ao renovar token:', error);
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
        
        // Se o token expira em menos de 30 minutos, renovar
        if (tokenExpiry - currentTime < 1800) {
          await refreshToken(user);
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
      }
    };

    // Verificar token na inicialização
    checkAndRefreshToken();

    // Configurar renovação automática a cada 6 horas (aumentado de 30 minutos)
    const interval = setInterval(() => {
      if (user) {
        refreshToken(user);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user, refreshToken]);

  return { refreshToken };
};