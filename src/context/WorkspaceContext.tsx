"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AppDataContext';
import { Workspace, WorkspacePage, PageViewType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceContextProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  pages: WorkspacePage[];
  activePageId: string | null;
  setActivePageId: (id: string | null) => void;
  loading: boolean;
  createWorkspace: (name: string, icon?: string) => Promise<string>;
  updateWorkspace: (id: string, name: string, icon?: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  createPage: (workspaceId: string, name: string, viewType?: PageViewType, icon?: string, origin?: WorkspacePage['origin'], parent?: string) => Promise<string>;
  updatePage: (id: string, updates: Partial<WorkspacePage>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [pages, setPages] = useState<WorkspacePage[]>([]);
  
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch workspaces
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspaceId(null);
      setLoading(false);
      return;
    }

    const workspacesRef = collection(db, `users/${user.uid}/workspaces`);
    const q = query(workspacesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Workspace[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Workspace);
      });
      setWorkspaces(data);
      
      // Auto-select first workspace if none selected
      if (!activeWorkspaceId && data.length > 0) {
        setActiveWorkspaceId(data[0].id);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching workspaces:", error);
      toast({ title: "Error loading workspaces", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeWorkspaceId, toast]);

  // Fetch pages for active workspace
  useEffect(() => {
    if (!user || !activeWorkspaceId) {
      setPages([]);
      setActivePageId(null);
      return;
    }

    const pagesRef = collection(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages`);
    const unsubscribe = onSnapshot(query(pagesRef), (snapshot) => {
      const data: WorkspacePage[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as WorkspacePage);
      });
      setPages(data);
      
      // Auto-select first page if none selected, or if selected page is in another workspace
      if (!activePageId || !data.find(p => p.id === activePageId)) {
        setActivePageId(data.length > 0 ? data[0].id : null);
      }
    }, (error) => {
      console.error("Error fetching pages:", error);
    });

    return () => unsubscribe();
  }, [user, activeWorkspaceId, activePageId]);

  const createWorkspace = async (name: string, icon?: string) => {
    if (!user) throw new Error("Not authenticated");
    const workspaceRef = doc(collection(db, `users/${user.uid}/workspaces`));
    
    await setDoc(workspaceRef, {
      name,
      icon: icon || "🎯",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return workspaceRef.id;
  };

  const updateWorkspace = async (id: string, name: string, icon?: string) => {
    if (!user) return;
    const ref = doc(db, `users/${user.uid}/workspaces/${id}`);
    await updateDoc(ref, {
      name,
      ...(icon && { icon }),
      updatedAt: serverTimestamp()
    });
  };

  const deleteWorkspace = async (id: string) => {
    if (!user) return;
    
    // Deleting a workspace should also delete all its pages
    const workspacePages = pages.filter(p => p.workspaceId === id);
    const fullUrlRegex = /https:\/\/res\.cloudinary\.com\/[^\s"']+/g;
    
    for (const p of workspacePages) {
      if (p.content) {
        const matches = p.content.match(fullUrlRegex);
        if (matches && matches.length > 0) {
          for (const url of new Set(matches)) {
            try {
              await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
              });
            } catch (e) {
              console.error("Failed to delete Cloudinary file on workspace delete:", e);
            }
          }
        }
      }
      // Delete page document itself
      try {
        await deleteDoc(doc(db, `users/${user.uid}/pages/${p.id}`));
      } catch (e) {
        console.error(`Failed to delete page ${p.id} on workspace delete:`, e);
      }
    }

    const ref = doc(db, `users/${user.uid}/workspaces/${id}`);
    await deleteDoc(ref);
    
    if (activeWorkspaceId === id) {
      // Find another workspace to fallback to, if any
      const remainingWorkspaces = workspaces.filter(w => w.id !== id);
      if (remainingWorkspaces.length > 0) {
        setActiveWorkspaceId(remainingWorkspaces[0].id);
      } else {
        setActiveWorkspaceId(null);
      }
    }
  };

const createPage = async (workspaceId: string, name: string, viewType: PageViewType = 'blocks', icon?: string, origin?: WorkspacePage['origin'], parent?: string) => {
    if (!user) throw new Error("Not authenticated");
    const pageRef = doc(collection(db, `users/${user.uid}/workspaces/${workspaceId}/pages`));

    const newPage: any = {
      workspaceId,
      name,
      viewType,
      icon: icon || "📄",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (origin) {
      newPage.origin = origin;
    }
    if (parent) {
      newPage.parent = parent;
    }

    await setDoc(pageRef, newPage);
    
    return pageRef.id;
  };

  const updatePage = async (id: string, updates: Partial<WorkspacePage>) => {
    if (!user || !activeWorkspaceId) return;
    const ref = doc(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${id}`);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  };

  const deletePage = async (id: string) => {
    if (!user || !activeWorkspaceId) return;

    // Helper function to recursively find all children of a page
    const getPageAndChildren = (pageId: string): WorkspacePage[] => {
      const page = pages.find(p => p.id === pageId);
      if (!page) return [];
      const children = pages.filter(p => p.parent === pageId || p.origin?.pageId === pageId);
      const descendants = children.flatMap(child => getPageAndChildren(child.id));
      return [page, ...descendants];
    };

    const pagesToDelete = getPageAndChildren(id);

    // Delete embedded files from Cloudinary and delete from Firestore for each page
    for (const pageToDelete of pagesToDelete) {
      if (pageToDelete.content) {
        const fullUrlRegex = /https:\/\/res\.cloudinary\.com\/[^\s"']+/g;
        const matches = pageToDelete.content.match(fullUrlRegex);
        if (matches && matches.length > 0) {
          for (const url of new Set(matches)) {
            try {
              await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
              });
            } catch (e) {
              console.error("Failed to delete Cloudinary file on page delete:", e);
            }
          }
        }
      }
      
      const ref = doc(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageToDelete.id}`);
      await deleteDoc(ref);

      if (activePageId === pageToDelete.id) {
        setActivePageId(null);
      }
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces, activeWorkspaceId, setActiveWorkspaceId,
      pages, activePageId, setActivePageId,
      loading,
      createWorkspace, updateWorkspace, deleteWorkspace,
      createPage, updatePage, deletePage
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}