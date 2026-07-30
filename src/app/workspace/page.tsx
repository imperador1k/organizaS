'use client';

import { AppLayout } from '@/components/AppLayout';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { WorkspaceContent } from '@/components/workspace/WorkspaceContent';

export default function WorkspacePage() {
  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-10rem)] w-full border rounded-lg overflow-hidden bg-background">
        <WorkspaceSidebar />
        <div className="flex-1 overflow-hidden relative">
          <WorkspaceContent />
        </div>
      </div>
    </AppLayout>
  );
}
