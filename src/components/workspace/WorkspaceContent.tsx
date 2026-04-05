"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { FileText, SquareKanban, Network } from "lucide-react";
import dynamic from "next/dynamic";

const BlockEditor = dynamic<{ pageId: string }>(() => import('@/components/workspace/BlockEditor').then(m => m.BlockEditor as any), { ssr: false });
const KanbanBoard = dynamic<{ pageId: string }>(() => import('@/components/workspace/KanbanBoard').then(m => m.KanbanBoard as any), { ssr: false });
const MindMapEditor = dynamic<{ pageId: string }>(() => import('@/components/workspace/MindmapEditor').then(m => m.MindmapEditor as any), { ssr: false });

export function WorkspaceContent() {
  const { pages, activePageId, updatePage } = useWorkspace();
  const page = pages.find((p) => p.id === activePageId);

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col h-full bg-background">
        <FileText className="h-12 w-12 mb-4 opacity-20" />
        <h2 className="text-xl font-medium">No Page Selected</h2>
        <p>Select a page from the sidebar or create a new one.</p>
      </div>
    );
  }

  const handleTitleChange = (newTitle: string) => {
    updatePage(page.id, { name: newTitle });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Title Header */}
      <div className="px-8 py-6 pb-2 shrink-0">
        <input 
          type="text"
          className="text-4xl font-bold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/30 focus:ring-0"
          value={page.name}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
        />
        <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-4">
          <span className="flex items-center">
            {page.viewType === 'blocks' && <FileText className="mr-1 h-3 w-3" />}
            {page.viewType === 'kanban' && <SquareKanban className="mr-1 h-3 w-3" />}
            {page.viewType === 'mindmap' && <Network className="mr-1 h-3 w-3" />}
            {page.viewType.charAt(0).toUpperCase() + page.viewType.slice(1)} View
          </span>
          <span>Last updated: {page.updatedAt ? new Date(page.updatedAt).toLocaleString() : 'Just now'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-4">
        {page.viewType === 'blocks' && <BlockEditor pageId={page.id} />}
        {page.viewType === 'kanban' && <KanbanBoard pageId={page.id} />}
        {page.viewType === 'mindmap' && <MindMapEditor pageId={page.id} />}
      </div>
    </div>
  );
}