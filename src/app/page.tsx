
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuth } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/components/Loader";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || (!user && typeof window !== 'undefined' && window.location.pathname !== '/login')) {
    return <Loader />;
  }

  // This prevents a flash of the dashboard if the user is not logged in.
  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
