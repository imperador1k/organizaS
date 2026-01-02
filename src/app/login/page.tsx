
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AppDataContext';
import { Loader2 } from 'lucide-react';
import { Loader } from '@/components/Loader';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[Login] User already authenticated, redirecting to home');
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Show loader while checking auth
  if (authLoading) {
    return <Loader />;
  }

  // If user is already logged in, show loader while redirecting
  if (user) {
    return <Loader />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login({ email, password }, rememberMe);

      if (result.success) {
        toast({
          title: 'Login Successful',
          description: rememberMe ? 'Welcome back! You will stay logged in for 180 days.' : 'Welcome back!',
        });
        router.push('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: result.error || 'An unexpected error occurred. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 auth-gradient-background">
      <div className="w-full max-w-md rounded-xl border bg-background/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <Link href="/" className="flex items-center justify-center gap-2 font-semibold mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <h1 className="text-3xl font-bold text-foreground">OrganizaS</h1>
          </Link>
          <p className="text-balance text-muted-foreground">
            Sign in to continue organizing your life.
          </p>
        </div>

        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember-me" className="text-sm">
              Remember me for 180 days
            </Label>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline font-semibold hover:text-primary">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
