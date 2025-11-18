'use client';

import { useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';

const SESSION_EXTENSION_INTERVAL = 30 * 60 * 1000; // 30 minutos

export const useSessionExtension = (user: User | null) => {
  const extendSession = useCallback(async () => {
    if (!user) return;
    
    try {
      // Renovar o token do Firebase
      await user.getIdToken(true);
      
      // Atualizar o timestamp da sessão no localStorage
      const stored = localStorage.getItem('organizas_auth_data');
      if (stored) {
        const authData = JSON.parse(stored);
        authData.timestamp = Date.now();
        localStorage.setItem('organizas_auth_data', JSON.stringify(authData));
      }
      
      console.log('Sessão estendida com sucesso');
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Estender a sessão imediatamente quando o usuário está ativo
    const extendOnActivity = () => {
      // Debounce para evitar chamadas excessivas
      clearTimeout((window as any).__sessionExtensionTimeout);
      (window as any).__sessionExtensionTimeout = setTimeout(() => {
        extendSession();
      }, 1000);
    };

    // Adicionar listeners para eventos de atividade do usuário
    window.addEventListener('mousemove', extendOnActivity, { passive: true });
    window.addEventListener('keypress', extendOnActivity, { passive: true });
    window.addEventListener('click', extendOnActivity, { passive: true });
    window.addEventListener('scroll', extendOnActivity, { passive: true });
    window.addEventListener('touchstart', extendOnActivity, { passive: true });
    window.addEventListener('touchmove', extendOnActivity, { passive: true });

    // Estender a sessão periodicamente
    const interval = setInterval(extendSession, SESSION_EXTENSION_INTERVAL);

    return () => {
      window.removeEventListener('mousemove', extendOnActivity);
      window.removeEventListener('keypress', extendOnActivity);
      window.removeEventListener('click', extendOnActivity);
      window.removeEventListener('scroll', extendOnActivity);
      window.removeEventListener('touchstart', extendOnActivity);
      window.removeEventListener('touchmove', extendOnActivity);
      clearInterval(interval);
      clearTimeout((window as any).__sessionExtensionTimeout);
    };
  }, [user, extendSession]);

  return { extendSession };
};