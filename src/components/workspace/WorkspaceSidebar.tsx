"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, SquareKanban, Network, FileText, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageViewType } from "@/lib/types";

export function WorkspaceSidebar() {
  const { 
    workspaces, 
    activeWorkspaceId, setActiveWorkspaceId, 
    pages, 
    activePageId, setActivePageId,
    createWorkspace,
    createPage,
    deleteWorkspace,
    deletePage
  } = useWorkspace();

  const [newWsName, setNewWsName] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [newPageViewType, setNewPageViewType] = useState<PageViewType>('blocks');
  const [isWsDialogOpen, setIsWsDialogOpen] = useState(false);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) return;
    await createWorkspace(newWsName, "🚀");
    setNewWsName("");
    setIsWsDialogOpen(false);
  };

  const handleCreatePage = async () => {
    if (!activeWorkspaceId || !newPageName.trim()) return;
    const id = await createPage(activeWorkspaceId, newPageName, newPageViewType);
    setActivePageId(id);
    setNewPageName("");
    setIsPageDialogOpen(false);
  };

  return (
    <div className="w-64 border-r border-border h-full bg-muted/20 flex flex-col pt-4">
      {/* Workspace Selector */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Workspace</span>
          <Dialog open={isWsDialogOpen} onOpenChange={setIsWsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5"><Plus className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Workspace</DialogTitle>
              </DialogHeader>
              <div className="flex space-x-2 pt-4">
                <Input value={newWsName} onChange={(e) => setNewWsName(e.target.value)} placeholder="Workspace name..." />
                <Button onClick={handleCreateWorkspace}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <select 
          className="w-full bg-background border border-border p-2 rounded-md text-sm"
          value={activeWorkspaceId || ''}
          onChange={(e) => setActiveWorkspaceId(e.target.value)}
        >
          <option value="" disabled>Select Workspace...</option>
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id}>{ws.icon} {ws.name}</option>
          ))}
        </select>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pages</span>
          <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5" disabled={!activeWorkspaceId}>
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input value={newPageName} onChange={(e) => setNewPageName(e.target.value)} placeholder="Page title..." />
                <div className="flex space-x-2">
                  <Button variant={newPageViewType === 'blocks' ? 'default' : 'outline'} onClick={() => setNewPageViewType('blocks')} className="flex-1">
                    <FileText className="mr-2 h-4 w-4" /> Doc
                  </Button>
                  <Button variant={newPageViewType === 'kanban' ? 'default' : 'outline'} onClick={() => setNewPageViewType('kanban')} className="flex-1">
                    <SquareKanban className="mr-2 h-4 w-4" /> Board
                  </Button>
                  <Button variant={newPageViewType === 'mindmap' ? 'default' : 'outline'} onClick={() => setNewPageViewType('mindmap')} className="flex-1">
                    <Network className="mr-2 h-4 w-4" /> Mindmap
                  </Button>
                </div>
                <Button onClick={handleCreatePage} className="w-full">Create Page</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1 px-2">
          {pages.map(page => (
            <div
              key={page.id}
              className={`flex items-center justify-between p-2 mb-1 rounded-md cursor-pointer transition-colors ${
                activePageId === page.id 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActivePageId(page.id)}
            >
              <div className="flex items-center truncate">
                {page.viewType === 'blocks' && <FileText className="mr-2 h-4 w-4" />}
                {page.viewType === 'kanban' && <SquareKanban className="mr-2 h-4 w-4" />}
                {page.viewType === 'mindmap' && <Network className="mr-2 h-4 w-4" />}
                <span className="truncate text-sm">{page.name}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('Are you sure you want to delete this page?')) {
                      deletePage(page.id);
                    }
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Page
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {pages.length === 0 && activeWorkspaceId && (
            <div className="text-xs text-center text-muted-foreground p-4">No pages yet. Create one!</div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}