'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Briefcase, Calendar, CheckCircle2, Building2, Flame, AlertOctagon, Info, ShieldAlert, Zap, TrendingUp, Search, Scale, Landmark, BookOpen, AlertCircle, Users, CheckCircle, FileText, ExternalLink, Wallet, Banknote, LineChart, Cloud, CreditCard, Box, Target } from 'lucide-react';
import { useAuth } from '@/context/AppDataContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';

const constitutionSteps = [
  { id: 's1', title: '1. Reservar o Nome da Empresa', description: 'Empresa na Hora com nome pré-aprovado é grátis. (Ou 75€ no IRN)' },
  { id: 's2', title: '2. Autenticação Digital', description: 'Cartão de Cidadão (com PINs ativos) ou Chave Móvel Digital.' },
  { id: 's3', title: '3. Depósito do Capital Social', description: 'Recomendado depositar 1.000-2.000€ na nova conta p/ despesas iniciais.' },
  { id: 's4', title: '4. Ir à Empresa na Hora', description: 'Obter NIPC, Certidão Permanente e registo na Seg. Social (~220€).' },
  { id: 's5', title: '5. Registo no RCBE', description: 'Obrigatório (no rcbe.justica.gov.pt) nos 30 dias após constituição.' },
  { id: 's6', title: '6. Início de Atividade (Finanças)', description: 'CAE 6201 (Principal) e 6311 (Secundário). Escolher regime IVA com o TOC.' },
  { id: 's7', title: '7. Abrir Conta Bancária', description: 'Conta corrente operacional em nome da empresa.' },
  { id: 's8', title: '8. Contratar TOC', description: 'Contabilista Certificado é obrigatório por lei para Lda. (~150-350€/mês).' },
  { id: 's9', title: '9. Certificação PME (IAPMEI)', description: 'Documento OBRIGATÓRIO para submeter a candidatura ao FITEC.' },
  { id: 's10', title: '10. Registo no Balcão dos Fundos', description: 'Elemento essencial exigido no Ponto 10 do Aviso FITEC.' },
];

export default function BusinessDashboard() {
  const { userProfile, updateUserProfile } = useAuth();
  
  // Start with default empty object, then update when profile loads
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  // Sync state with user profile when it loads
  React.useEffect(() => {
    if (userProfile?.businessChecklist) {
      setCheckedSteps(userProfile.businessChecklist);
    }
  }, [userProfile?.businessChecklist]);

  const toggleStep = async (id: string) => {
    const newChecked = !checkedSteps[id];
    const newState = {
      ...checkedSteps,
      [id]: newChecked
    };
    
    // Optimistic UI update
    setCheckedSteps(newState);
    
    // Save to Firebase
    await updateUserProfile({ businessChecklist: newState });
  };

  const progressPercentage = (Object.values(checkedSteps).filter(Boolean).length / constitutionSteps.length) * 100;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER CORPORATIVO COM BOTÃO PDF */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-lg border border-primary/20">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">empresa.lda</h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase font-bold tracking-wider">
                Em Constituição
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Produto Principal: <strong className="text-foreground">Faro</strong> (EdTech SaaS)
            </p>
          </div>
        </div>
        <div>
          <Button variant="outline" className="gap-2" onClick={() => window.open('/Start_from_Knowledge.pdf', '_blank')}>
            <FileText className="h-4 w-4" />
            PDF Oficial FITEC
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* 2 GRANDES MACRO-TABS (CEO VIEW) */}
      <Tabs defaultValue="genesys" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1 bg-muted/60 rounded-lg">
          <TabsTrigger value="genesys" className="py-3 text-sm md:text-base font-semibold gap-2">
            <Flame className="h-4 w-4" />
            1. Gênese & Financiamento
          </TabsTrigger>
          <TabsTrigger value="operacao" className="py-3 text-sm md:text-base font-semibold gap-2">
            <LineChart className="h-4 w-4" />
            2. Operação & Tesouraria
          </TabsTrigger>
        </TabsList>

        {/* ==================================================================== */}
        {/* TAB 1: GÊNESE & FINANCIAMENTO (CURTO PRAZO) */}
        {/* ==================================================================== */}
        <TabsContent value="genesys" className="focus-visible:outline-none focus-visible:ring-0 mt-0 space-y-8">
          
          {/* CARDS PRINCIPAIS: FITEC & RED FLAGS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* FUNDO FITEC WIDGET */}
            <Card className="border-primary/20 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Flame className="h-5 w-5 text-primary" />
                      Start from Knowledge
                    </CardTitle>
                    <CardDescription className="mt-1">Fundo FITEC (Deep2Start)</CardDescription>
                  </div>
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 font-semibold border-none">
                    30.000 € Aprovado
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Execução do Orçamento</span>
                    <span className="text-primary font-bold text-lg">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">Fundos pagos 100% adiantado após aceitação</p>
                </div>

                <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20 flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-destructive">Deadline: 30 de Setembro 2026</p>
                    <p className="text-xs text-destructive/80 mt-1 leading-tight">
                      Encerra antecipadamente se atingir limite (~75 vagas). <strong>Submeter ASAP!</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WARNING CARD (RED FLAGS) */}
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-600 flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  Despesas Estritamente Proibidas
                </CardTitle>
                <CardDescription className="text-amber-700/70">
                  Devolução imediata dos fundos se incluíres:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "IVA (Nunca elegível)",
                    "Fundo de Maneio (Working Capital)",
                    "Numerário (>250€)",
                    "Veículos / Automóveis",
                    "Juros e Encargos Bancários",
                    "Publicidade Corrente (Ads)"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-amber-700 font-medium bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                      <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* MANUAL TÁTICO: COMPRIMIDO EM ACCORDIONS */}
          <Card className="shadow-sm border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Manual Tático de Operações (Wiki)
              </CardTitle>
              <CardDescription>O mapa de guerra comprimido para consulta rápida.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                
                {/* ACCORDION 1: A FUNDAÇÃO */}
                <AccordionItem value="fundacao" className="border-b px-6">
                  <AccordionTrigger className="hover:no-underline py-5 group">
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-2 font-bold text-lg group-hover:text-primary transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        1. A Fundação da Lda.
                      </div>
                      <span className="text-sm text-muted-foreground font-normal mt-1">Checklist de 10 Passos, Custos e Estrutura Fiscal.</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 space-y-6">
                    <div className="bg-muted/20 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold flex items-center gap-2"><Target className="h-4 w-4" /> Progresso da Constituição</h4>
                        <span className="font-bold text-primary">{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-1.5 mb-6" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {constitutionSteps.map((step) => {
                          const isChecked = checkedSteps[step.id] || false;
                          return (
                            <div key={step.id} className={"flex items-start gap-3 p-3 rounded-md transition-colors cursor-pointer border " + (isChecked ? 'bg-muted/40 border-border/50' : 'bg-background hover:border-primary/50')} onClick={() => toggleStep(step.id)}>
                              <Checkbox checked={isChecked} className="mt-0.5" />
                              <div className="space-y-0.5">
                                <p className={"text-sm font-semibold leading-tight " + (isChecked ? 'line-through text-muted-foreground' : 'text-foreground')}>{step.title}</p>
                                <p className="text-xs text-muted-foreground leading-tight">{step.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-card">
                        <h5 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2"><Landmark className="h-4 w-4"/> Custos Iniciais</h5>
                        <ul className="text-sm space-y-1">
                          <li className="flex justify-between"><span>Empresa na Hora:</span> <strong>~220€</strong></li>
                          <li className="flex justify-between text-muted-foreground"><span>Capital (Depósito):</span> <span>1-2k€</span></li>
                        </ul>
                      </div>
                      <div className="p-4 border rounded-lg bg-card">
                        <h5 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2"><Briefcase className="h-4 w-4"/> Mensalidades (Burn)</h5>
                        <ul className="text-sm space-y-1">
                          <li className="flex justify-between text-destructive"><span>TOC:</span> <strong>150-350€/mês</strong></li>
                          <li className="flex justify-between text-muted-foreground"><span>Domicílio:</span> <span>30-50€/mês</span></li>
                        </ul>
                      </div>
                      <div className="p-4 border rounded-lg bg-card">
                        <h5 className="font-bold text-sm text-muted-foreground mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/> Matriz Fiscal</h5>
                        <ul className="text-sm space-y-1">
                          <li><strong>Sócio Único:</strong> Miguel (100%)</li>
                          <li><strong>CAE:</strong> 6201 (Principal) & 6311</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* ACCORDION 2: ESTRATÉGIA FITEC */}
                <AccordionItem value="estrategia" className="border-b px-6">
                  <AccordionTrigger className="hover:no-underline py-5 group">
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-2 font-bold text-lg group-hover:text-amber-500 transition-colors">
                        <TrendingUp className="h-5 w-5 text-amber-500" />
                        2. O Dossiê FITEC (Estratégia & Ameaças)
                      </div>
                      <span className="text-sm text-muted-foreground font-normal mt-1">Elegibilidade, Critério B.i (Inovação) e Plano de Orçamento.</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                      <h4 className="font-bold text-amber-700 flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4"/> A Grande Ameaça: Subcritério B.i</h4>
                      <p className="text-sm text-amber-800/80 mb-3">O fundo chumba sumariamente projetos que não comprovem ter raiz em I&D (Investigação e Desenvolvimento) académico.</p>
                      <div className="bg-background/80 p-3 rounded border text-sm text-foreground">
                        <strong>Defesa:</strong> Vincular a Faro a uma cadeira do IPT. Redigir relatório técnico sobre os algoritmos de Spaced Repetition e IA usados no motor do SaaS, justificando-o como *Deep Tech*.
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/> Orçamento Sugerido (30.000€)</h4>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead>Rubrica Estratégica</TableHead>
                              <TableHead className="text-right">Montante</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium text-sm">Consultoria Arquitetura Segura (PoC)</TableCell>
                              <TableCell className="text-right text-sm">6.000€</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-sm">Design UX/UI Premium & Pitch Deck</TableCell>
                              <TableCell className="text-right text-sm">5.000€</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-sm">Infraestrutura AWS (Testes Piloto)</TableCell>
                              <TableCell className="text-right text-sm">4.000€</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-sm">Proteção Patentes IP Algoritmo</TableCell>
                              <TableCell className="text-right text-sm">4.000€</TableCell>
                            </TableRow>
                            <TableRow className="bg-primary/5">
                              <TableCell className="font-bold">Total Planeado</TableCell>
                              <TableCell className="text-right font-bold text-primary">19.000€ (Sobra 11k€)</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* ACCORDION 3: OBRIGAÇÕES */}
                <AccordionItem value="obrigacoes" className="px-6 border-none">
                  <AccordionTrigger className="hover:no-underline py-5 group">
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-2 font-bold text-lg group-hover:text-destructive transition-colors">
                        <ShieldAlert className="h-5 w-5 text-destructive" />
                        3. Burocracia & Pós-Projeto
                      </div>
                      <span className="text-sm text-muted-foreground font-normal mt-1">Tabela de Reduções (Castigos) e Obrigações Legais.</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                        <h4 className="font-bold text-destructive flex items-center gap-2 mb-3"><Scale className="h-4 w-4"/> Tabela de Corte (Devoluções)</h4>
                        <Table className="bg-background rounded-md overflow-hidden">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Previstas vs Feitas</TableHead>
                              <TableHead className="text-right text-xs">Corte</TableHead>
                              <TableHead className="text-right text-xs">A Devolver</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-sm font-medium">3 / <span className="text-emerald-500">3</span></TableCell>
                              <TableCell className="text-right text-sm">0%</TableCell>
                              <TableCell className="text-right text-sm font-bold">0 €</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">3 / <span className="text-amber-500">2</span></TableCell>
                              <TableCell className="text-right text-sm">33%</TableCell>
                              <TableCell className="text-right text-sm font-bold text-amber-500">~10.000 €</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">3 / <span className="text-destructive">1</span></TableCell>
                              <TableCell className="text-right text-sm">67%</TableCell>
                              <TableCell className="text-right text-sm font-bold text-destructive">~20.000 €</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-card">
                          <h4 className="font-bold text-sm flex items-center gap-2 mb-1"><AlertCircle className="h-4 w-4 text-primary"/> Termo de Aceitação</h4>
                          <p className="text-sm text-muted-foreground">Tens <strong>30 dias úteis</strong> após a aprovação para assinar o termo, senão a bolsa caduca.</p>
                        </div>
                        <div className="border rounded-lg p-4 bg-card">
                          <h4 className="font-bold text-sm flex items-center gap-2 mb-1"><Building2 className="h-4 w-4 text-primary"/> Estatuto Startup Oficial</h4>
                          <p className="text-sm text-muted-foreground">É obrigatório por lei requerer o estatuto no portal Gov.pt no prazo de 60 dias úteis após os 12 meses do projeto.</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================================== */}
        {/* TAB 2: OPERAÇÃO & TESOURARIA (LONGO PRAZO - CEO) */}
        {/* ==================================================================== */}
        <TabsContent value="operacao" className="focus-visible:outline-none focus-visible:ring-0 mt-0 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* WIDGET 1: DÍVIDA DO FUNDADOR (OUT OF POCKET) */}
            <Card className="shadow-md border border-primary/20 bg-primary/5">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Banknote className="h-5 w-5" />
                  Dívida do Fundador (Reembolsos)
                </CardTitle>
                <CardDescription className="text-primary/70">
                  Capital injetado do teu bolso que a empresa te deve.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Total a Reembolsar</p>
                    <p className="text-4xl font-black text-foreground mt-1">0,00 <span className="text-2xl text-muted-foreground">€</span></p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                    <CheckCircle className="h-3 w-3" /> Registar Despesa
                  </Button>
                </div>
                <div className="h-px bg-primary/10 my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-background/50">
                    <span className="text-muted-foreground">Empresa na Hora (Estimativa)</span>
                    <span className="font-mono text-muted-foreground">220,00 €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-background/50">
                    <span className="text-muted-foreground">Contabilista Inicial (Estimativa)</span>
                    <span className="font-mono text-muted-foreground">300,00 €</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WIDGET 2: CLOUD & TECH PERKS */}
            <Card className="shadow-sm border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-indigo-500" />
                  Cloud & Tech Perks
                </CardTitle>
                <CardDescription>
                  Saldo de créditos gratuitos para infraestrutura.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                
                {/* MICROSOFT AZURE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <Box className="h-4 w-4 text-blue-500" /> Microsoft Founders Hub
                    </div>
                    <span className="font-mono text-muted-foreground">$5,000</span>
                  </div>
                  <Progress value={100} className="h-2 bg-muted [&>div]:bg-blue-500" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Azure & OpenAI Credits</span>
                    <span className="text-blue-500/80 font-medium">Status: Inativo</span>
                  </div>
                </div>

                {/* AWS ACTIVATE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <Cloud className="h-4 w-4 text-orange-500" /> AWS Activate
                    </div>
                    <span className="font-mono text-muted-foreground">$1,000</span>
                  </div>
                  <Progress value={100} className="h-2 bg-muted [&>div]:bg-orange-500" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>EC2, RDS, Fargate</span>
                    <span className="text-orange-500/80 font-medium">Status: Inativo</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* WIDGET 3: RUNWAY & BURN RATE (PLACEHOLDER) */}
          <Card className="shadow-sm border-dashed border-2 bg-muted/10 h-64 flex flex-col items-center justify-center text-center">
            <LineChart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-muted-foreground mb-2">Tesouraria & Runway</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Integração com ficheiros CSV/Excel bancários chegará no futuro para visualização automática do Burn Rate mensal e estimativa de tempo de vida (Runway).
            </p>
            <Badge variant="outline" className="text-xs uppercase tracking-widest font-bold">Em Breve</Badge>
          </Card>

        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
