'use client';

import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/components/Loader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { WorkspaceContent } from "@/components/workspace/WorkspaceContent";

export default function WorkspacePage() {
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

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="h-[calc(100dvh-4rem)] md:h-[calc(100vh-1rem)] w-full flex bg-background overflow-hidden relative border rounded-xl shadow-sm">
        <div className="hidden md:flex h-full shrink-0">
          <WorkspaceSidebar />
        </div>
        <WorkspaceContent />
      </div>
    </AppLayout>
  );
}
