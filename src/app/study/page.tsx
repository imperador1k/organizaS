'use client';

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/components/Loader";

const NOTION_LINK = "https://www.notion.so/Estudos-294a52270b0f80c7b3a6edf01ca858bf?source=copy_link";

export default function StudyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || (!user && typeof window !== 'undefined' && window.location.pathname !== '/login')) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  const handleOpenNotion = () => {
    window.open(NOTION_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-8 md:py-16">
        <div className="w-full max-w-2xl mx-auto px-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center space-y-8">
                {/* Icon with animated background */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative bg-primary/10 p-6 rounded-full border-2 border-primary/30">
                    <BookOpen className="h-16 w-16 md:h-20 md:w-20 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                    Organize os Seus Estudos
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Para organizar os estudos, clique aqui. Gerencie as suas tarefas escolares de forma eficiente e mantenha tudo organizado no Notion.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleOpenNotion}
                    size="lg"
                    className="group relative h-14 px-8 md:px-12 text-base md:text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-100"
                  >
                    <BookOpen className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Abrir Notion
                    <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </Button>
                  <p className="mt-4 text-sm text-muted-foreground">
                    O link abrirá em uma nova aba
                  </p>
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t border-border/50 w-full">
                  <p className="text-sm text-muted-foreground/80">
                    Todas as suas tarefas escolares estão organizadas no Notion. 
                    Clique no botão acima para acessar e começar a estudar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

