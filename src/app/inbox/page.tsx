"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AppDataContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { InboxItem } from "@/lib/types";
import { AppLayout } from "@/components/AppLayout";
import { Trash2, Image as ImageIcon, PenTool, ExternalLink, Download, FolderOutput, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function InboxPage() {
  const { user } = useAuth();
  const { workspaces, createPage, updatePage } = useWorkspace();
  const { toast } = useToast();
  
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Triage state
  const [triageItem, setTriageItem] = useState<InboxItem | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [newPageName, setNewPageName] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/inbox`),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => doc.data() as InboxItem));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string, isMovingToWorkspace = false) => {
    if (!user) return;
    try {
      if (!isMovingToWorkspace) {
        // If we are actually deleting it (not just moving it), find the item to delete its attachments from Cloudinary
        const itemToDelete = items.find(i => i.id === id);
        if (itemToDelete && itemToDelete.attachments) {
          for (const att of itemToDelete.attachments) {
            if (att.url.includes("res.cloudinary.com")) {
              await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: att.url })
              });
            }
          }
        }
      }

      await deleteDoc(doc(db, `users/${user.uid}/inbox`, id));
      if (!isMovingToWorkspace) toast({ title: "Deleted", description: "Item removed from inbox." });
    } catch (e) {
      console.error(e);
      if (!isMovingToWorkspace) toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
    }
  };

  const handleOpenTriage = (item: InboxItem) => {
    setTriageItem(item);
    setNewPageName(item.content ? item.content.slice(0, 30) + (item.content.length > 30 ? "..." : "") : "New Page from Inbox");
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0].id);
    }
  };

  const handleTriageConfirm = async () => {
    if (!user || !triageItem || !selectedWorkspace || !newPageName.trim()) return;
    setIsTriaging(true);
    try {
      // 1. Create a new Page in the targeted Workspace
      const newPageId = await createPage(selectedWorkspace, newPageName.trim(), 'blocks');
      
      // 2. Format content + attachments to HTML/JSON for the Editor.
      // Easiest is writing simple HTML so the tiptap BlockEditor parses it as blocks.
      let htmlContent = `<p>${triageItem.content.replace(/\n/g, '<br/>')}</p>`;
      
      if (triageItem.attachments.length > 0) {
        htmlContent += `<p></p><h4>Attachments:</h4><ul>`;
        triageItem.attachments.forEach(att => {
          htmlContent += `<li><a href="${att.url}" target="_blank">${att.name}</a></li>`;
        });
        htmlContent += `</ul>`;
      }

      // 3. Update page with that content
      await updatePage(newPageId, { content: htmlContent });

      // 4. Delete from Inbox
      await handleDelete(triageItem.id, true);
      
      toast({ title: "Success", description: "Moved to Workspace." });
      setTriageItem(null);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to move to Workspace.", variant: "destructive" });
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto w-full p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Inbox</h2>
          <p className="text-muted-foreground">{items.length} items</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <p>Your inbox is empty.</p>
            <p className="text-sm mt-2">Use the + button in the corner to quickly capture ideas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card border rounded-lg p-5 shadow-sm space-y-4 relative group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 whitespace-pre-wrap font-medium pb-2">
                    {item.content || <span className="text-muted-foreground italic">No text content</span>}
                  </div>
                  <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenTriage(item)} className="shrink-0 gap-2">
                      <FolderOutput className="w-4 h-4" />
                      <span className="hidden sm:inline">Move to Workspace</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {item.attachments && item.attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted p-3 rounded-md border text-sm overflow-hidden">
                        {att.type === 'image' ? (
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <ImageIcon className="w-5 h-5 shrink-0 text-blue-500" />
                            <a href={att.url} target="_blank" rel="noreferrer" className="truncate hover:underline font-medium text-blue-600 dark:text-blue-400">
                              {att.name}
                            </a>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <PenTool className="w-5 h-5 shrink-0 text-purple-500" />
                            <a href={att.url} download={att.name} target="_blank" rel="noreferrer" className="truncate hover:underline font-medium text-purple-600 dark:text-purple-400">
                              {att.name}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Captured on {format(item.createdAt, 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!triageItem} onOpenChange={(val) => !val && setTriageItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Target Workspace</Label>
              {workspaces.length === 0 ? (
                <div className="text-sm text-destructive">You don't have any workspaces yet. Create one in the sidebar first.</div>
              ) : (
                <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workspace..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map(ws => (
                      <SelectItem key={ws.id} value={ws.id}>{ws.icon} {ws.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Page Name</Label>
              <Input 
                value={newPageName} 
                onChange={(e) => setNewPageName(e.target.value)} 
                placeholder="e.g., App Idea, Architecture Spec..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTriageItem(null)} disabled={isTriaging}>Cancel</Button>
            <Button onClick={handleTriageConfirm} disabled={isTriaging || !selectedWorkspace || !newPageName.trim()}>
              {isTriaging ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FolderOutput className="w-4 h-4 mr-2" />}
              Move to Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
