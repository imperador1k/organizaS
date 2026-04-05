"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AppDataContext";
import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, CheckSquare, Paperclip, ImageIcon, Loader2 } from 'lucide-react';
import { Loader } from "@/components/Loader";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";

const IframeExtension = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      class: {
        default: 'w-full h-[400px] md:h-[600px] border-2 border-border/50 shadow-sm rounded-xl my-4',
      },
      title: {
        default: 'Document Viewer'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes, { allowfullscreen: 'true' })]
  },
})

export function BlockEditor({ pageId }: { pageId: string }) {
  const { pages, updatePage } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const page = pages.find((p) => p.id === pageId);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // We attach content to the page object for simpler syncing 
  const pageContent = (page as any)?.content || '';

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: base64Data,
          userId: user.uid,
          fileName: file.name
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      
      const downloadURL = data.url;

      if (file.type.startsWith('image/')) {
        editor?.chain().focus().setImage({ src: downloadURL }).run();
      } else if (file.type === 'application/pdf') {
        // O Google Docs Viewer é a forma mais clean universal em iframes. 
        // Antes falhou porque o Cloudinary não estava a colocar o ".pdf" no link. Como já corrigimos isso na API, agora o Google vai ler o PDF maravilhosamente!
        const pdfViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(downloadURL)}&embedded=true`;
        editor?.chain().focus().insertContent(`
          <iframe src="${pdfViewerUrl}" title="PDF Viewer" class="w-full h-[400px] md:h-[600px] border-2 border-border/50 shadow-sm rounded-xl my-4"></iframe>
          <p><a href="${downloadURL}" target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground underline decoration-muted-foreground/30 hover:text-primary transition-colors">🔗 Abrir em ecrã inteiro / Fazer Download do PDF original</a></p><p></p>
        `).run();
      } else if (
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx') || file.name.endsWith('.doc')
      ) {
        // Microsoft precisava que o ficheiro Cloudinary tivesse um link a terminar em .docx (o que corrigimos na API)
        const wordViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(downloadURL)}`;
        editor?.chain().focus().insertContent(`
          <iframe src="${wordViewerUrl}" title="Word Document Viewer" class="w-full h-[400px] md:h-[600px] border-2 border-border/50 shadow-sm rounded-xl my-4"></iframe>
          <p><a href="${downloadURL}" target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground underline decoration-muted-foreground/30 hover:text-primary transition-colors">🔗 Abrir / Fazer Download do Ficheiro Original</a></p><p></p>
        `).run();
      } else {
        // Fallback for other files like Zip or unknown types
        editor?.chain().focus().insertContent(`<a href="${downloadURL}" target="_blank" rel="noopener noreferrer" class="text-primary font-medium underline flex items-center gap-1 my-2">📎 ${file.name}</a><p></p>`).run();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      IframeExtension,
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: "Press '/' for commands, or start typing...",
      }),
    ],
    content: pageContent,
    editorProps: {
      attributes: {
        class: "prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[500px] border border-border/50 rounded-xl p-4 md:p-8 bg-card shadow-sm prose-img:rounded-md prose-img:max-h-[500px]"
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          handleFileUpload(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const hasFiles = event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0;
        const hasHTML = event.clipboardData?.types.includes('text/html');
        // Prevent intercepting if they're pasting rich text that might contain an image payload
        if (hasFiles && !hasHTML) {
          event.preventDefault();
          const file = event.clipboardData!.files[0];
          handleFileUpload(file);
          return true;
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      
      saveTimeout.current = setTimeout(async () => {
        await updatePage(pageId, { content: editor.getHTML() } as any);
        setIsSaving(false);
      }, 1500);
    }
  });

  // Watch for external page changes
  useEffect(() => {
    if (editor && pageContent && !isSaving) {
      if (editor.getHTML() !== pageContent) {
        editor.commands.setContent(pageContent);
      }
    }
  }, [pageId, pageContent]);

  if (!editor || !page) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto w-full pt-4 pb-32">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Press <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">#</kbd> for headings, <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">- [ ]</kbd> for tasks
        </div>
        <div className="text-xs font-medium text-muted-foreground/70 flex items-center gap-3">
          {isUploading && (
            <span className="flex items-center text-blue-500">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Uploading...
            </span>
          )}
          {isSaving ? (
            <span className="flex items-center text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-2"></span>
              Saving...
            </span>
          ) : (
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Saved
            </span>
          )}
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="bg-white dark:bg-zinc-900 shadow-xl border border-border/40 rounded-lg flex items-center p-1 space-x-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${editor.isActive('bold') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${editor.isActive('italic') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${editor.isActive('strike') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border/40 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${editor.isActive('code') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border/40 mx-1" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            title="Upload File"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="bg-white dark:bg-zinc-900 shadow-xl border border-border/40 rounded-lg flex items-center p-1 space-x-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border/40 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${editor.isActive('bulletList') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${editor.isActive('taskList') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Task List"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border/40 mx-1" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            title="Upload File"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
