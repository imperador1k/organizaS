'use client';

import { useCallback } from 'react';
import { useAuth } from '@/context/AppDataContext';

export const useLogoutCleanup = () => {
  const { logout } = useAuth();

  const performLogout = useCallback(async () => {
    try {
      // Limpar dados do localStorage
      const keysToRemove = [
        'organizas_auth_data',
        'organizas_user_preferences',
        'organizas_temp_data',
      ];

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`Erro ao remover ${key}:`, error);
        }
      });

      // Limpar dados de sessão
      try {
        sessionStorage.clear();
      } catch (error) {
        console.error('Erro ao limpar sessionStorage:', error);
      }

      // Limpar cookies relacionados à autenticação
      try {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          if (name.includes('auth') || name.includes('session') || name.includes('token')) {
            document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
      } catch (error) {
        console.error('Erro ao limpar cookies:', error);
      }

      // Executar logout do Firebase
      const result = await logout();
      
      return result;
    } catch (error) {
      console.error('Erro durante limpeza de logout:', error);
      return { success: false, error: 'Erro durante logout' };
    }
  }, [logout]);

  return { performLogout } as { performLogout: () => Promise<{ success: boolean; error?: string } | void> };
};
