'use client';

import { useState } from 'react';
import { curriculum, playbooks, commandments, goals, baseRoutine, DayType, resources, mentorPrompt } from '@/lib/plan';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Target, BookOpen, AlertCircle, Code2, Globe, Clock, Library, Bot, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { AppLayout } from '@/components/AppLayout';

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mentorPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estamos no "Mês 0" (Agosto 2026) da Pré-Época!
  const currentMonthIndex = 0; 

  const dayKeys: DayType[] = ["Seg-Qui", "Sexta", "Sábado", "Domingo"];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            O Meu Quartel General
          </h1>
          <p className="text-muted-foreground">
            O teu roadmap estratégico de 12 meses. O caminho para o sucesso remoto começa com descanso.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 h-auto gap-1">
            <TabsTrigger value="timeline" className="py-2">Timeline</TabsTrigger>
            <TabsTrigger value="rotina" className="py-2">Rotina</TabsTrigger>
            <TabsTrigger value="manifesto" className="py-2">Regras</TabsTrigger>
            <TabsTrigger value="recursos" className="py-2">Recursos</TabsTrigger>
            <TabsTrigger value="mentor" className="py-2">Mentor AI</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-8">
            <div className="relative border-l-2 border-muted ml-4 pl-6 space-y-12">
              {curriculum.map((month, index) => {
                const isCurrent = index === currentMonthIndex;
                const isPast = index < currentMonthIndex;

                return (
                  <div key={month.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[35px] h-6 w-6 rounded-full border-4 border-background flex items-center justify-center 
                      ${isCurrent ? 'bg-primary ring-4 ring-primary/20' : isPast ? 'bg-muted-foreground' : 'bg-muted'}`}
                    />
                    
                    <Card className={`transition-all ${isCurrent ? 'border-primary shadow-md' : 'opacity-80 hover:opacity-100'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <CardTitle className="text-xl">{month.month} — {month.phase}</CardTitle>
                            <CardDescription className="text-sm font-semibold text-primary mt-1">{month.date}</CardDescription>
                          </div>
                          {isCurrent && <Badge variant="default" className="animate-pulse">Fase Atual</Badge>}
                          {isPast && <Badge variant="secondary">Concluído</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        
                        {month.technical.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold flex items-center gap-2 mb-2 text-foreground/80"><Code2 className="h-4 w-4"/> Foco Principal</h4>
                            <ul className="space-y-1.5">
                              {month.technical.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {month.languages.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold flex items-center gap-2 mb-2 text-foreground/80"><Globe className="h-4 w-4"/> Mindset & Idiomas</h4>
                            <ul className="space-y-1.5">
                              {month.languages.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="bg-secondary/50 p-4 rounded-lg mt-4 border border-secondary">
                          <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-foreground"><CheckCircle2 className="h-4 w-4 text-green-500"/> Critérios de Sucesso</h4>
                          <ul className="space-y-2">
                            {month.successCriteria.map((item, i) => (
                              <li key={i} className="text-sm flex items-start gap-2 font-medium">
                                <div className="h-4 w-4 rounded-sm border border-primary/50 mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="rotina" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dayKeys.map(day => (
                <Card key={day} className="border-primary/10">
                  <CardHeader className="bg-secondary/30 pb-4">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {day}
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {baseRoutine[day].map(block => (
                        <div key={block.id} className="flex gap-3 relative">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-primary w-10 text-right">{block.slot}</span>
                            <div className="w-px h-full bg-border my-1" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="bg-secondary/50 rounded-md p-2.5 border border-border/50">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-semibold text-foreground">{block.title}</span>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{block.category}</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">{block.duration}h</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manifesto" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-primary"/> Os 10 Mandamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {commandments.map((cmd, idx) => (
                      <li key={idx} className="text-sm font-medium flex gap-3 items-start">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        {cmd}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {playbooks.map(pb => (
                <Card key={pb.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground"/> {pb.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {pb.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recursos" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {resources.map((res, idx) => (
                <Card key={idx} className="border-primary/10">
                  <CardHeader className="bg-secondary/30 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Library className="h-4 w-4 text-primary" />
                      {res.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-4">
                      {res.items.map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <div className="mt-1 flex-shrink-0">
                            {item.type === 'book' ? <BookOpen className="h-4 w-4 text-muted-foreground" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.author}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentor" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Bot className="h-5 w-5 text-primary" />
                    Prompt do Mentor de Engenharia
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Copia este texto e cola no ChatGPT ou Claude para reajustar o teu plano estrategicamente. Não te esqueças de preencher a secção "A Situação Atual".
                  </CardDescription>
                </div>
                <Button onClick={handleCopy} variant="default" className="flex items-center gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-secondary/50 p-6 rounded-md border border-border/50 overflow-x-auto">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {mentorPrompt}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
