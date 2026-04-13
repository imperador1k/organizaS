"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { Upload, Download, ExternalLink, Presentation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExcalidrawViewer({ pageId }: { pageId: string }) {
  const { pages, updatePage } = useWorkspace();
  const page = pages.find((p) => p.id === pageId);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Verify it's loosely a valid JSON Excalidraw file
        const parsed = JSON.parse(text);
        if (parsed.elements || parsed.type === "excalidraw") {
          updatePage(pageId, { content: text });
          // Optional: Add a simple toast/notification here if you have one configured
        } else {
          alert("O ficheiro não parece ser um Excalidraw válido.");
        }
      } catch (error) {
        console.error("Invalid Excalidraw file", error);
        alert("Ocorreu um erro ao ler o ficheiro. Certifica-te que é um ficheiro .excalidraw válido.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const handleExportJSON = () => {
    if (!page?.content) return;
    
    const blob = new Blob([page.content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${page.name || "diagram"}.excalidraw`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!page) return <div className="p-4"><Loader2 className="animate-spin" /></div>;

  const hasDiagram = !!page.content && page.content.includes('"elements"');

  return (
    <div className="flex flex-col w-full h-[calc(100vh-220px)] min-h-[500px] items-center justify-center space-y-6">
      <div className="text-center space-y-4 max-w-md">
        <Presentation className="w-16 h-16 mx-auto text-purple-400 opacity-80" />
        <h2 className="text-2xl font-semibold">Excalidraw Vault</h2>
        <p className="text-muted-foreground text-sm">
          A tua base de dados na Cloud para ficheiros <span className="font-semibold text-foreground">.excalidraw</span>. 
          Descarrega e faz upload dos teus diagramas para mantê-los seguros na tua conta.
        </p>
        
        {hasDiagram ? (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 my-6 space-y-2">
            <p className="text-purple-300 font-medium">Diagrama guardado com sucesso! 🎉</p>
            <p className="text-xs text-muted-foreground pb-2">
              Faz o Download e abre-o no site oficial do Excalidraw para editares nativamente com todas as ferramentas de desenho.
            </p>
            <a 
              href="https://excalidraw.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ir para Excalidraw.com <ExternalLink className="ml-1 w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="bg-muted/30 border rounded-lg p-4 my-6">
            <p className="text-sm text-muted-foreground">
              Ainda não guardaste nenhum ficheiro aqui.
            </p>
          </div>
        )}

        <div className="flex justify-center space-x-4 pt-4">
          <Button onClick={() => document.getElementById('excalidraw-upload')?.click()}>
            <Upload className="h-4 w-4 mr-2" /> 
            {hasDiagram ? "Substituir" : "Fazer Upload"}
          </Button>
          <input 
            type="file" 
            id="excalidraw-upload" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          
          <Button variant="outline" onClick={handleExportJSON} disabled={!hasDiagram}>
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </div>
    </div>
  );
}