"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { useEffect, useState, useCallback } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AppDataContext";
import { Loader } from "@/components/Loader";
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export function MindmapEditor({ pageId }: { pageId: string }) {
  const { user } = useAuth();
  const { activeWorkspaceId } = useWorkspace();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !activeWorkspaceId || !pageId) return;

    const nodesRef = collection(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/mind_map_nodes`);
    const unsubscribeNodes = onSnapshot(query(nodesRef), (snapshot) => {
      const data: Node[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        data.push({ 
            id: doc.id, 
            position: d.position || { x: 0, y: 0 },
            data: { label: d.title || 'Untitled Node' }
        });
      });
      setNodes(data);
      setLoading(false);
    });

    const edgesRef = collection(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/mind_map_edges`);
    const unsubscribeEdges = onSnapshot(query(edgesRef), (snapshot) => {
      const data: Edge[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        data.push({ id: doc.id, source: d.source, target: d.target });
      });
      setEdges(data);
    });

    return () => {
      unsubscribeNodes();
      unsubscribeEdges();
    };
  }, [user, activeWorkspaceId, pageId]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  if (loading) return <Loader />;

  return (
    <div className="w-full h-[calc(100vh-14rem)] min-h-[500px] border border-border/50 rounded-xl bg-card overflow-hidden relative">
      {nodes.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center pointer-events-none">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Canvas is Empty</h3>
            <p className="text-sm max-w-sm mb-6 leading-relaxed text-muted-foreground">
              This space uses React Flow! Add nodes to start brainstorming natively.
            </p>
            <button className="pointer-events-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-bold">
              Add Central Topic (Soon!)
            </button>
        </div>
      ) : null}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="var(--border)" gap={24} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
