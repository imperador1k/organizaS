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

  // Handle redirect when there's an auth error
  useEffect(() => {
    if (isInitialized && error && !user) {
      router.push('/login');
    }
  }, [isInitialized, error, user, router]);

  // Handle redirect when there's no user and not on auth pages
  useEffect(() => {
    if (isInitialized && !user && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  // Se ainda está carregando ou não foi inicializado, mostrar loader
  if (loading || !isInitialized) {
    return <Loader />;
  }

  // If we're redirecting, show loader
  if ((error && !user) || (!user && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup'))) {
    return <Loader />;
  }

  return <>{children}</>;
};