"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AppDataContext";
import { Loader } from "@/components/Loader";
import { Plus, Trash2, Maximize, Minimize, Copy, Link as LinkIcon, ExternalLink, ArrowRightLeft } from "lucide-react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
  Handle,
  Position,
  BaseEdge,
  EdgeProps,
  getBezierPath,
  ReactFlowProvider,
  useReactFlow,
  MiniMap,
  Connection,
  Panel,
  EdgeLabelRenderer
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- CUSTOM EDGE ---
function MindMapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps & { data?: any }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isBidirectional = data?.bidirectional;
  
  return (
    <>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
        <defs>
          <marker id={`arrow-start-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={data?.color || 'hsl(var(--primary))'} style={{ opacity: 0.5 }} />
          </marker>
        </defs>
      </svg>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={isBidirectional ? `url(#arrow-start-${id})` : undefined}
        style={{ ...style, strokeWidth: 3, stroke: data?.color || 'hsl(var(--primary) / 0.5)' }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="opacity-0 hover:opacity-100 transition-opacity bg-card border border-border shadow-md rounded-md p-1 flex gap-1 z-50 group"
        >
          <button className="p-1 hover:bg-muted rounded text-foreground" title="Toggle Bidirectional" onClick={() => data?.onToggleBidirectional?.(id)}>
            <ArrowRightLeft className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-muted rounded text-destructive" title="Delete Edge" onClick={() => data?.onDeleteEdge?.(id)}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// --- CUSTOM NODE ---
function MindMapNode({ id, data, selected }: any) {
  const [hovered, setHovered] = useState(false);
  const [localVal, setLocalVal] = useState(data.label);
  const isRoot = id === 'root';

  useEffect(() => {
    // Only sync down if different (avoids fighting local typing)
    if (data.label !== localVal) setLocalVal(data.label);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.label]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    data.onChange(id, val);

    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleLinkSet = () => {
    let currentUrl = data.url || "";
    // Extremely simple prompt for setting link.
    const newUrl = prompt("Enter URL (starting with http:// or https://):", currentUrl);
    if (newUrl !== null) {
      // Very basic validation / correction
      let formattedUrl = newUrl.trim();
      if (formattedUrl && !formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = "https://" + formattedUrl;
      }
      data.onUpdateUrl(id, formattedUrl);
    }
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.url) {
      window.open(data.url, '_blank');
    }
  };

  return (
    <div
      className={`relative px-5 py-3 min-w-[180px] shadow-sm rounded-xl transition-all duration-200 border-2
        ${isRoot ? 'bg-primary text-primary-foreground border-primary shadow-primary/20' : 'bg-card text-foreground border-border'}
        ${selected ? (isRoot ? 'ring-4 ring-primary/30 scale-105' : 'border-primary ring-4 ring-primary/20 shadow-md scale-105') : (isRoot ? '' : 'hover:border-primary/50')}
        flex flex-col justify-center group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {data.url && (
        <button 
          onClick={handleOpenLink}
          className="absolute -top-3 -left-3 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
          title={`Visit: ${data.url}`}
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      )}

      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!w-3 !h-3 rounded-full !bg-muted-foreground !border-2 !border-background shadow-sm -ml-1.5" 
        />
      )}
      
      <textarea 
        className={`bg-transparent outline-none w-full text-sm font-bold text-center resize-none overflow-hidden h-[24px] 
          ${isRoot ? 'text-primary-foreground placeholder:text-primary-foreground/70' : 'text-foreground placeholder:text-muted-foreground/50'} leading-tight block`} 
        value={localVal} 
        onChange={handleChange} 
        placeholder={isRoot ? "Central Idea" : "New Node"}
        rows={1}
        onFocus={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
      />

      <Handle 
        type="source" 
        position={Position.Right} 
        className={`!w-3 !h-3 rounded-full !border-2 !border-background shadow-sm -mr-1.5 ${isRoot ? '!bg-background' : '!bg-primary'}`} 
      />
      
      {/* Action Buttons */}
      <div className={`absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-all duration-200 ${hovered || selected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
        <button
          onClick={() => data.onAddChild(id)}
          className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
          title="Add branch"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => data.onDuplicate(id)}
          className="bg-secondary text-secondary-foreground rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform border border-border"
          title="Duplicate node"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={handleLinkSet}
          className="bg-accent text-accent-foreground rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform border border-border"
          title={data.url ? "Edit Link" : "Add Link"}
        >
          <LinkIcon className="w-3 h-3" />
        </button>
      </div>

      {!isRoot && (
        <div className={`absolute -top-3 -right-3 transition-opacity duration-200 ${hovered || selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button 
            onClick={() => data.onDelete(id)} 
            className="bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
            title="Delete node"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

const nodeTypes = { mindmap: MindMapNode };
const edgeTypes = { mindmap: MindMapEdge };

// --- MAIN CONTENT ---
function FlowContent({ pageId, isFullscreen, toggleFullscreen }: { pageId: string, isFullscreen: boolean, toggleFullscreen: () => void }) {
  const { user } = useAuth();
  const { activeWorkspaceId } = useWorkspace();
  const { fitView, getNodes, getEdges } = useReactFlow();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestore Docs Helpers
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  const getNodesRef = () => collection(db, `users/${user!.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/mind_map_nodes`);
  const getEdgesRef = () => collection(db, `users/${user!.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/mind_map_edges`);

  // Load initial data
  useEffect(() => {
    if (!user || !activeWorkspaceId || !pageId) return;

    let isFirstLoad = true;

    // We use onSnapshot for realtime, but we need to inject the callbacks into node data
    const unsubscribeNodes = onSnapshot(query(getNodesRef()), (snapshot) => {
      const newNodes: Node[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        newNodes.push({
          id: docSnap.id,
          type: 'mindmap',
          position: d.position || { x: 0, y: 0 },
          data: { 
            label: d.label || '', 
            // Injected below just before setting state to avoid recreating closures constantly if possible, 
            // but for simplicity we inject them in a useMemo wrapper or later. 
            // Wait, injecting callbacks in a snapshot means they must access the LATEST state or use `setNodes(prev => ...)` 
            ...d 
          },
        });
      });

      // If empty on first load, seed the root node
      if (newNodes.length === 0 && isFirstLoad) {
        const rootNode = {
          id: 'root',
          position: { x: 250, y: 250 },
          label: 'Central Idea'
        };
        setDoc(doc(getNodesRef(), 'root'), rootNode);
        return; // Early return, the snapshot will catch it again
      }

      setNodes(prev => {
        // Merge the server data with local state to preserve callbacks and avoid overwriting dragging operations completely,
        // though standard practice is to just replace it and let React Flow figure it out based on IDs.
        return newNodes;
      });
      
      setLoading(false);
      
      if (isFirstLoad && newNodes.length > 0) {
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
      }
      isFirstLoad = false;
    });

    const unsubscribeEdges = onSnapshot(query(getEdgesRef()), (snapshot) => {
      const newEdges: Edge[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        newEdges.push({
          id: docSnap.id,
          source: d.source,
          target: d.target,
          type: 'mindmap',
          animated: false,
        });
      });
      setEdges(newEdges);
    });

    return () => {
      unsubscribeNodes();
      unsubscribeEdges();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeWorkspaceId, pageId, fitView]);

  // --- ACTIONS ---

  // Update label in Firestore
  const updateNodeLabel = useCallback((id: string, label: string) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    setDoc(doc(getNodesRef(), id), { label }, { merge: true });
  }, [user, activeWorkspaceId, pageId]);

  // Add child
  const handleAddChild = useCallback((parentId: string) => {
    if (!user || !activeWorkspaceId || !pageId) return;

    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const parent = currentNodes.find(n => n.id === parentId);
    if (!parent) return;

    // Simple layout hack: place child entirely to the right, slightly offset
    const siblings = currentEdges.filter(e => e.source === parentId).length;
    const yOffset = (siblings * 100) - ((siblings * 100) / 2);

    const newId = `node_${generateId()}`;
    const edgeId = `edge_${generateId()}`;

    // Write to Firestore
    const batch = writeBatch(db);

    const newNodeRef = doc(getNodesRef(), newId);
    batch.set(newNodeRef, {
      position: { x: parent.position.x + 300, y: parent.position.y + yOffset + (Math.random() * 50) },
      label: ''
    });

    const newEdgeRef = doc(getEdgesRef(), edgeId);
    batch.set(newEdgeRef, {
      source: parentId,
      target: newId
    });

    batch.commit();
  }, [user, activeWorkspaceId, pageId, getNodes, getEdges]);

  // Connect Nodes Manually
  const onConnect = useCallback((params: Connection) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    const edgeId = `edge_${generateId()}`;
    const newEdgeRef = doc(getEdgesRef(), edgeId);
    setDoc(newEdgeRef, {
      source: params.source,
      target: params.target
    });
  }, [user, activeWorkspaceId, pageId]);

  // Add Independent Node
  const handleAddIndependentNode = useCallback(() => {
    if (!user || !activeWorkspaceId || !pageId) return;

    const currentNodes = getNodes();
    const rootNode = currentNodes.find(n => n.id === 'root');
    const startX = rootNode ? rootNode.position.x : 250;
    const startY = rootNode ? rootNode.position.y : 250;

    const newId = `node_${generateId()}`;
    const newNodeRef = doc(getNodesRef(), newId);
    
    setDoc(newNodeRef, {
      position: { 
        x: startX + (Math.random() > 0.5 ? 1 : -1) * (150 + Math.random() * 200), 
        y: startY + (Math.random() > 0.5 ? 1 : -1) * (150 + Math.random() * 200) 
      },
      label: ''
    });
  }, [user, activeWorkspaceId, pageId, getNodes]);

  // Duplicate Node
  const handleDuplicateNode = useCallback((id: string) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    if (id === 'root') return; // Do not duplicate root completely

    const currentNodes = getNodes();
    const targetNode = currentNodes.find(n => n.id === id);
    if (!targetNode) return;

    const newId = `node_${generateId()}`;
    const newNodeRef = doc(getNodesRef(), newId);
    
    setDoc(newNodeRef, {
      position: { 
        x: targetNode.position.x + 50, 
        y: targetNode.position.y + 50 
      },
      label: (targetNode.data as any).label || ''
    });
  }, [user, activeWorkspaceId, pageId, getNodes]);

  // Delete node
  const handleDeleteNode = useCallback((id: string) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    if (id === 'root') return; // Can't delete root

    // Delete node and all connected edges
    const batch = writeBatch(db);
    batch.delete(doc(getNodesRef(), id));
    
    // Find edges to delete (source or target)
    edges.forEach(e => {
      if (e.source === id || e.target === id) {
        batch.delete(doc(getEdgesRef(), e.id));
      }
    });

    batch.commit();
  }, [user, activeWorkspaceId, pageId, edges]);

  // --- XYFLOW CALLBACKS ---

  // When dragging stops, save the final position to Firebase
  const onNodeDragStop = useCallback((_: any, node: Node) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    setDoc(doc(getNodesRef(), node.id), { position: node.position }, { merge: true });
  }, [user, activeWorkspaceId, pageId]);

  // Local state changes for smooth dragging
  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [],
  );

  const handleUpdateUrl = useCallback((id: string, url: string) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    setDoc(doc(getNodesRef(), id), { url }, { merge: true });
  }, [user, activeWorkspaceId, pageId]);

  const handleToggleBidirectional = useCallback((id: string) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    const edge = edges.find(e => e.id === id);
    if (!edge) return;
    const currentBidirectional = edge.data?.bidirectional || false;
    setDoc(doc(getEdgesRef(), id), { bidirectional: !currentBidirectional }, { merge: true });
  }, [user, activeWorkspaceId, pageId, edges]);

  const handleDeleteEdge = useCallback((id: string) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    deleteDoc(doc(getEdgesRef(), id));
  }, [user, activeWorkspaceId, pageId]);

  // Inject callbacks into nodes before rendering
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        onChange: updateNodeLabel,
        onAddChild: handleAddChild,
        onDelete: handleDeleteNode,
        onDuplicate: handleDuplicateNode,
        onUpdateUrl: handleUpdateUrl
      }
    }));
  }, [nodes, updateNodeLabel, handleAddChild, handleDeleteNode, handleDuplicateNode, handleUpdateUrl]);

  const edgesWithCallbacks = useMemo(() => {
    return edges.map(e => ({
      ...e,
      data: {
        ...e.data,
        onToggleBidirectional: handleToggleBidirectional,
        onDeleteEdge: handleDeleteEdge
      }
    }));
  }, [edges, handleToggleBidirectional, handleDeleteEdge]);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader /></div>;
  }

  return (
    <ReactFlow
      nodes={nodesWithCallbacks}
      edges={edgesWithCallbacks}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      minZoom={0.2}
      maxZoom={3}
      fitView
      className="bg-muted/10"
    >
      <Background color="var(--border)" gap={24} size={2} />
      
      <Panel position="top-left" className="m-4 flex gap-2">
        <button 
          onClick={handleAddIndependentNode}
          className="flex items-center gap-2 bg-primary text-primary-foreground shadow-md rounded-full px-4 py-2 text-sm font-semibold hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> Floating Node
        </button>
      </Panel>
      <Panel position="top-right" className="m-4">
        <button 
          onClick={toggleFullscreen}
          className="flex items-center justify-center w-10 h-10 bg-card text-foreground border border-border shadow-md rounded-full hover:bg-muted active:scale-95 transition-all text-muted-foreground/80 hover:text-foreground"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </Panel>

      <Controls className="shadow-md rounded-md overflow-hidden [&_button]:bg-card [&_button]:border-border [&_button:hover]:bg-muted [&_svg]:fill-foreground [&_button]:border-b" />
      <MiniMap 
        nodeColor={(node) => {
          return node.id === 'root' ? 'var(--primary)' : 'hsl(var(--muted-foreground) / 0.3)';
        }}
        maskColor="hsl(var(--background) / 0.8)"
        className="bg-card border border-border shadow-md rounded-md"
      />
    </ReactFlow>
  );
}

export function MindmapEditor({ pageId }: { pageId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full bg-card relative ${isFullscreen ? 'h-screen fixed inset-0 z-[100] border-none rounded-none' : 'h-[calc(100vh-14rem)] min-h-[600px] border border-border/50 rounded-xl overflow-hidden shadow-sm'}`}
    >
      <ReactFlowProvider>
        <FlowContent pageId={pageId} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
      </ReactFlowProvider>
    </div>
  );
}
