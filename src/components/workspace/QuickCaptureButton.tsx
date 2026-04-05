"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AppDataContext";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Image as ImageIcon, Loader2, PenTool } from "lucide-react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";

export function QuickCaptureButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<{ type: 'image' | 'excalidraw' | 'file'; url: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    // We can support images directly, but Excalidraw files are JSON
    // We could upload them similarly if the backend supports raw upload or just read them as text for now
    // For simplicity, let's treat anything non-image as a raw file upload if configured, 
    // or just handle images first.
    
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        let type: 'image' | 'excalidraw' | 'file' = file.type.startsWith('image/') ? 'image' : 'file';
        if (file.name.endsWith('.excalidraw')) {
          type = 'excalidraw';
        }

        // For actual Excalidraw files, the backend might need adjusting (currently expects imageDataUrl). 
        // By converting to data URL (FileReader reads as DataURL default if we use readAsDataURL).
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageDataUrl: base64Data, // DataURL format works for any file if the backend parses it, but images are best
            userId: user.uid,
            fileName: file.name
          }),
        });

        if (!response.ok) throw new Error("Upload failed");
        
        const { url } = await response.json();
        setAttachments(prev => [...prev, { type, url, name: file.name }]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user || (!content.trim() && attachments.length === 0)) return;
    setLoading(true);
    try {
      const id = nanoid();
      const inboxRef = doc(collection(db, `users/${user.uid}/inbox`), id);
      await setDoc(inboxRef, {
        id,
        content,
        attachments,
        createdAt: Date.now()
      });
      setIsOpen(false);
      setContent("");
      setAttachments([]);
      toast({ title: "Captured!", description: "Saved to your Inbox." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save note", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl shadow-primary/30 z-[100] flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 active:scale-95 transition-all"
        title="Quick Capture (Inbox)"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Capture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea
              placeholder="What's your crazy idea?"
              className="resize-none min-h-[120px] focus-visible:ring-primary/50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group bg-muted rounded-md p-2 flex items-center gap-2 border border-border text-sm max-w-full">
                    {att.type === 'image' ? <ImageIcon className="w-4 h-4 shrink-0 text-blue-500" /> : <PenTool className="w-4 h-4 shrink-0 text-purple-500" />}
                    <span className="truncate">{att.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*,.excalidraw,.json"
                  onChange={handleFileChange}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                  Upload Image / Excalidraw
                </Button>
              </div>
              <Button onClick={handleSave} disabled={loading || (!content.trim() && attachments.length === 0)}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save to Inbox'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


