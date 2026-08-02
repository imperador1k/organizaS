'use client';

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Rocket, BrainCircuit, CheckCircle2 } from 'lucide-react';

export default function WorkspacePage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <Card className="max-w-2xl w-full border-primary/20 shadow-lg text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Rocket className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Metas & Workspace Migrados</CardTitle>
            <CardDescription className="text-base mt-2">
              Tomaste uma decisão de <strong>Senior Engineer</strong>. Em vez de reinventar a roda construindo um clone do Notion, 
              delegaste a gestão de conhecimento para uma ferramenta open-source especializada (AppFlowy).
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <BrainCircuit className="h-6 w-6 text-indigo-500 mb-2" />
                <h4 className="font-semibold text-sm">Local AI (Ollama)</h4>
                <p className="text-xs text-muted-foreground mt-1">Privacidade total com modelos locais a correr na tua máquina.</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg border">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-2" />
                <h4 className="font-semibold text-sm">Offline First</h4>
                <p className="text-xs text-muted-foreground mt-1">Os teus dados pertencem-te. Rápidos e sem depender de cloud.</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg border">
                <ExternalLink className="h-6 w-6 text-orange-500 mb-2" />
                <h4 className="font-semibold text-sm">Open Source</h4>
                <p className="text-xs text-muted-foreground mt-1">Comunidade gigante, plugins e atualizações constantes.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-border/50">
              <Button 
                size="lg" 
                className="w-full sm:w-auto gap-2 bg-[#6B21A8] hover:bg-[#581C87] text-white"
                onClick={() => window.open('appflowy://', '_self')}
              >
                Abrir AppFlowy Localmente
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto gap-2"
                onClick={() => window.open('https://appflowy.com/', '_blank')}
              >
                Website Oficial <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
