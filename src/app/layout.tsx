
'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Loader } from '@/components/Loader';
import { cn } from '@/lib/utils';
import { AppDataProvider, useAuth } from '@/context/AppDataContext';
import { AuthInitializer } from '@/components/AuthInitializer';
import { SessionStatus } from '@/components/SessionStatus';
import { OneSignalInit } from '@/components/OneSignalInit';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-sora' });

const unauthenticatedRoutes = ['/login', '/signup'];

function AppContent({ children }: { children: React.ReactNode }) {
  const { loading: authLoading } = useAuth();
  const [showingLoader, setShowingLoader] = useState(true);
  const pathname = usePathname();
  const isUnauthenticatedRoute = unauthenticatedRoutes.includes(pathname);

  useEffect(() => {
    if (!authLoading) {
      // Give a small delay for the fade-out animation to be pleasant
      const timer = setTimeout(() => setShowingLoader(false), 500);
      return () => clearTimeout(timer);
    } else {
      setShowingLoader(true);
    }
  }, [authLoading]);

  // While auth is loading, we show the loader.
  if (authLoading && !isUnauthenticatedRoute) {
    return <Loader />;
  }

  // This handles the initial load animation
  if (showingLoader && isUnauthenticatedRoute) {
    return <Loader />;
  }

  return (
    <>
      <AuthInitializer>
        <div className={cn("transition-opacity duration-300", authLoading ? "opacity-0" : "opacity-100")}>
          <SessionStatus />
          {children}
        </div>
      </AuthInitializer>
      <Toaster />
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <title>OrganizaS</title>
        <meta name="description" content="Your personal AI-powered habit and routine organizer." />
        {/* Web app manifest and icons for PWA installs */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-512.png" sizes="512x512" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="font-body antialiased">
        <OneSignalInit />
        <AppDataProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AppContent>{children}</AppContent>
          </ThemeProvider>
        </AppDataProvider>
      </body>
    </html>
  );
}
