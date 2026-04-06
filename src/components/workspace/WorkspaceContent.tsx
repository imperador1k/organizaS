"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { FileText, SquareKanban, Network, Menu, ArrowLeft, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import dynamic from "next/dynamic";

const BlockEditor = dynamic<{ pageId: string }>(() => import('@/components/workspace/BlockEditor').then(m => m.BlockEditor as any), { ssr: false });
const KanbanBoard = dynamic<{ pageId: string }>(() => import('@/components/workspace/KanbanBoard').then(m => m.KanbanBoard as any), { ssr: false });
const MindMapEditor = dynamic<{ pageId: string }>(() => import('@/components/workspace/MindmapEditor').then(m => m.MindmapEditor as any), { ssr: false });

export function WorkspaceContent() {
  const { pages, activePageId, updatePage, setActivePageId } = useWorkspace();
  const page = pages.find((p) => p.id === activePageId);

  const MobileMenu = () => (
    <div className="md:hidden absolute top-4 left-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="bg-background shadow-sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <WorkspaceSidebar />
        </SheetContent>
      </Sheet>
    </div>
  );

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col h-full bg-background relative relative">
        <MobileMenu />
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
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <MobileMenu />

      {/* Title Header */}
      <div className="px-4 md:px-8 py-4 md:py-6 pb-2 shrink-0 mt-10 md:mt-0 items-start flex flex-col">
        {page.origin && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-3 h-8 px-3 text-xs font-semibold text-indigo-500/80 hover:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 shadow-sm flex flex-row items-center space-x-1.5 transition-all"
            onClick={() => setActivePageId(page.origin!.pageId)}
            title="Go back to original Board/Map"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {page.origin.type === 'kanban' ? <SquareKanban className="w-3.5 h-3.5" /> : <Network className="w-3.5 h-3.5" />}
            <span>Back to {page.origin.type === 'kanban' ? 'Board' : 'Mind Map'}</span>
          </Button>
        )}
        <input 
          type="text"
          className="text-2xl md:text-4xl font-bold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/30 focus:ring-0"
          value={page.name}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
        />
        <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-4">
          <span className="flex items-center">
            {page.viewType === 'blocks' && <FileText className="mr-1 h-3 w-3" />}
            {page.viewType === 'kanban' && <SquareKanban className="mr-1 h-3 w-3" />}
            {page.viewType === 'mindmap' && <Network className="mr-1 h-3 w-3" />}
            {page.viewType === 'folder' && <Folder className="mr-1 h-3 w-3" />}
            {page.viewType.charAt(0).toUpperCase() + page.viewType.slice(1)} {page.viewType === 'folder' ? '' : 'View'}
          </span>
          <span>
            Last updated: {
              page.updatedAt 
                ? (typeof page.updatedAt === 'object' && 'toDate' in page.updatedAt 
                    ? (page.updatedAt as any).toDate().toLocaleString()
                    : new Date(page.updatedAt as any).toLocaleString())
                : 'Just now'
            }
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 md:px-8 py-4">
        {page.viewType === 'blocks' && <BlockEditor pageId={page.id} />}
        {page.viewType === 'kanban' && <KanbanBoard pageId={page.id} />}
        {page.viewType === 'mindmap' && <MindMapEditor pageId={page.id} />}
        {page.viewType === 'folder' && (
          <div className="flex flex-col items-center justify-center h-full opacity-50 fade-in">
            <Folder className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-medium">This is a Folder</h3>
            <p className="text-sm mt-2">Use the sidebar to add and manage files inside this folder.</p>
          </div>
        )}
      </div>
    </div>
  );
}