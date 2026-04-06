"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, SquareKanban, Network, FileText, Settings, Trash2, ChevronDown, ChevronRight, FolderPlus, Folder, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageViewType, WorkspacePage } from "@/lib/types";

export function WorkspaceSidebar() {
  const {
    workspaces,
    activeWorkspaceId, setActiveWorkspaceId,
    pages,
    activePageId, setActivePageId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createPage,
    deletePage,
    updatePage
  } = useWorkspace();

  const [newWsName, setNewWsName] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [newPageViewType, setNewPageViewType] = useState<PageViewType>('blocks');
  const [isWsDialogOpen, setIsWsDialogOpen] = useState(false);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [parentForNewPage, setParentForNewPage] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Drag and Drop state
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

  const toggleFolder = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) return;
    await createWorkspace(newWsName, "🚀");
    setNewWsName("");
    setIsWsDialogOpen(false);
  };

  const handleCreatePage = async () => {
    if (!activeWorkspaceId || !newPageName.trim()) return;
    // Pass origin as undefined (since we're not creating from mindmap/kanban tool directly), but pass the parent
    const id = await createPage(activeWorkspaceId, newPageName, newPageViewType, undefined, undefined, parentForNewPage || undefined);

    // If it was created within a folder, ensure the folder is expanded
    if (parentForNewPage) {
      setExpandedFolders(prev => ({ ...prev, [parentForNewPage]: true }));
    }

    setActivePageId(id);
    setNewPageName("");
    setParentForNewPage(null);
    setIsPageDialogOpen(false);
  };

  const openCreateDialog = (parentId: string | null = null) => {
    setParentForNewPage(parentId);
    setNewPageName("");
    setNewPageViewType('blocks');
    setIsPageDialogOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedPageId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allows the drop
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetParentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedPageId || draggedPageId === targetParentId) {
      setDraggedPageId(null);
      return;
    }

    // Cycle detection: Make sure the target is not a child of the dragged item
    let currentParent = targetParentId;
    let isCycle = false;
    while (currentParent) {
      if (currentParent === draggedPageId) {
        isCycle = true;
        break;
      }
      const p = pages.find(p => p.id === currentParent);
      currentParent = p?.parent || p?.origin?.pageId || "";
    }

    if (!isCycle) {
      await updatePage(draggedPageId, { parent: targetParentId });
      // Auto-expand target
      setExpandedFolders(prev => ({ ...prev, [targetParentId]: true }));
    }
    setDraggedPageId(null);
  };

  const handleDropRoot = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPageId) return;
    await updatePage(draggedPageId, { parent: "" }); // Remove parent
    setDraggedPageId(null);
  };

  const renderPageItem = (page: WorkspacePage, depth = 0) => {
    // Both explicitly set children (via parent field) and older legacy children via origin 
    const children = pages.filter(p => p.parent === page.id || p.origin?.pageId === page.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders[page.id];

    return (
      <div key={page.id}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, page.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, page.id)}
          className={`flex items-center justify-between p-2 mb-1 rounded-md cursor-pointer transition-colors group ${activePageId === page.id
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            } ${draggedPageId === page.id ? 'opacity-50' : ''}`}
          style={{ paddingLeft: `${0.5 + (depth * 1.0)}rem` }}
          onClick={() => setActivePageId(page.id)}
        >
          <div className="flex items-center truncate">
            {hasChildren ? (
              <div
                className="w-4 h-4 mr-1 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 rounded"
                onClick={(e) => toggleFolder(e, page.id)}
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </div>
            ) : (
              <div className={`${depth > 0 ? 'w-5' : 'w-1'}`} />
            )}

            {page.viewType === 'blocks' && <FileText className="mr-2 h-4 w-4 shrink-0 text-indigo-400" />}
            {page.viewType === 'kanban' && <SquareKanban className="mr-2 h-4 w-4 shrink-0 text-amber-500" />}
            {page.viewType === 'mindmap' && <Network className="mr-2 h-4 w-4 shrink-0 text-emerald-500" />}
            {page.viewType === 'folder' && <Folder className="mr-2 h-4 w-4 shrink-0 text-blue-400" />}
            <span className="truncate text-sm">{page.name}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100 shrink-0">
                <Settings className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                openCreateDialog(page.id);
              }}>
                <FolderPlus className="mr-2 h-4 w-4" /> Add Sub-page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                const newName = prompt("Enter new name:", page.name);
                if (newName && newName.trim()) {
                  updatePage(page.id, { name: newName.trim() });
                }
              }}>
                <Edit2 className="mr-2 h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this page and its contents?')) {
                  deletePage(page.id);
                  // Optionally could recursively delete children, but for now we trust orphaned children handlers or manual deletes
                }
              }}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {children.map(child => renderPageItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootPages = pages.filter(p => !p.parent && !p.origin);

  return (
    <div className="flex w-64 border-right border-border h-full bg-muted/10 flex-col pt-4 shrink-0">
      {/* Workspace Selector */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Workspace</span>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-5 w-5" disabled={!activeWorkspaceId} onClick={(e) => {
              e.stopPropagation();
              const ws = workspaces.find(w => w.id === activeWorkspaceId);
              if (ws) {
                const newName = prompt("Enter new workspace name:", ws.name);
                if (newName && newName.trim()) {
                  updateWorkspace(ws.id, newName.trim());
                }
              }
            }}>
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:bg-destructive/10" disabled={!activeWorkspaceId} onClick={(e) => {
              e.stopPropagation();
              if (activeWorkspaceId && confirm('Atenção: Queres eliminar este Workspace e TODOS os documentos nele contidos? Esta ação não pode ser revertida!')) {
                deleteWorkspace(activeWorkspaceId);
              }
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
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
            <Dialog open={isPageDialogOpen} onOpenChange={(open) => {
              if (!open) {
                setParentForNewPage(null);
              }
              setIsPageDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={!activeWorkspaceId} onClick={() => openCreateDialog(null)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{parentForNewPage ? 'New Sub-page' : 'New Page'}</DialogTitle>
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
                    <Button variant={newPageViewType === 'folder' ? 'default' : 'outline'} onClick={() => setNewPageViewType('folder')} className="flex-1">
                      <Folder className="mr-2 h-4 w-4" /> Folder
                    </Button>
                  </div>
                  <Button onClick={handleCreatePage} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea
            className="flex-1 px-2 pb-10"
            onDragOver={handleDragOver}
            onDrop={handleDropRoot}
          >
            <div className="min-h-full pb-20">
              {rootPages.map(page => renderPageItem(page))}
              {rootPages.length === 0 && activeWorkspaceId && (
                <div className="text-xs text-center text-muted-foreground p-4">No pages yet. Create one!</div>
              )}

              {/* Visual drop zone at the bottom to easily move items to root level */}
              <div
                className="flex-1 h-32 mt-4 rounded border-2 border-dashed border-transparent hover:border-muted-foreground/30 flex items-center justify-center text-muted-foreground/50 text-xs"
                onDragOver={handleDragOver}
                onDrop={handleDropRoot}
              >
                Drop here to move to root
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}



