'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AppDataContext';
import { Loader } from '@/components/Loader';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  // Handle redirect when auth is done loading and there's an error or no user
  useEffect(() => {
    if (!loading && !user) {
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/signup');
      if (!isAuthPage) {
        router.push('/login');
      }
    }
  }, [loading, user, router]);

  // Mostrar loader enquanto está a carregar
  if (loading) {
    return <Loader />;
  }

  // Se não há user e não está numa página de auth, mostrar loader enquanto redireciona
  const isAuthPage = typeof window !== 'undefined' &&
    (window.location.pathname.includes('/login') || window.location.pathname.includes('/signup'));

  if (!user && !isAuthPage) {
    return <Loader />;
  }

  return <>{children}</>;
};