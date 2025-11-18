
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AppDataContext';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
      });
      return;
    }
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Name is required',
        description: 'Please enter your name.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup({ email, password, displayName: name }, rememberMe);
      
      if (result.success) {
        toast({
          title: 'Account Created',
          description: rememberMe 
            ? `Welcome, ${name}! You will stay logged in for 180 days.` 
            : `Welcome, ${name}! You have been successfully signed up.`,
        });
        router.push('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: result.error || 'An unexpected error occurred. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
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
                    Create your account to start your journey.
                </p>
            </div>
            <form onSubmit={handleSignup} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        className="bg-background/50"
                    />
                </div>
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
                    <Label htmlFor="password">Password</Label>
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
                <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Create an account
                </Button>
            </form>
            <div className="mt-6 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline font-semibold hover:text-primary">
                    Sign in
                </Link>
            </div>
        </div>
    </div>
  );
}
