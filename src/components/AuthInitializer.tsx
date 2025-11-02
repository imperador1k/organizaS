'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AppDataContext';
import { Loader } from '@/components/Loader';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { user, loading, error } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Aguardar um pouco para garantir que a autenticação foi verificada
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Se ainda está carregando ou não foi inicializado, mostrar loader
  if (loading || !isInitialized) {
    return <Loader />;
  }

  // Se há erro de autenticação, redirecionar para login
  if (error && !user) {
    router.push('/login');
    return <Loader />;
  }

  // Se não há usuário e não está em uma rota de autenticação, redirecionar para login
  if (!user && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
    router.push('/login');
    return <Loader />;
  }

  return <>{children}</>;
};
