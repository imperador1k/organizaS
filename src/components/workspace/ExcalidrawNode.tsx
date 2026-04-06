import { NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

export default function ExcalidrawNode(props: any) {
  const { node, updateAttributes } = props;
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (node.attrs.url) {
      // Fetch Excalidraw JSON from URL
      fetch(node.attrs.url)
        .then(res => res.json())
        .then(data => setInitialData(data))
        .catch(err => console.error("Failed to load Excalidraw", err));
    }
  }, [node.attrs.url]);

  return (
    <NodeViewWrapper className="excalidraw-node my-4 rounded-xl border border-border/50 overflow-hidden shadow-sm relative">
      <div className="w-full h-[600px] bg-background">
        {initialData ? (
          <Excalidraw 
            initialData={{ 
              elements: initialData.elements || [], 
              appState: { ...initialData.appState, viewModeEnabled: true } 
            }} 
            onChange={(elements, state) => {
              // Optionally save changes if we want it editable natively.
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            Loading Excalidraw...
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
