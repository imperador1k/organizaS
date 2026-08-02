import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Edit, Trash2, Target, Calendar, Dumbbell, BookOpen, Coffee, Code, User, MoreVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useAppData } from '@/context/AppDataContext';
import { ScheduledItem } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const DAYS = [
  { id: '1', label: 'Segunda' },
  { id: '2', label: 'Terça' },
  { id: '3', label: 'Quarta' },
  { id: '4', label: 'Quinta' },
  { id: '5', label: 'Sexta' },
  { id: '6', label: 'Sábado' },
  { id: '0', label: 'Domingo' }
];

const ICONS = [
  { value: 'Target', icon: Target },
  { value: 'Calendar', icon: Calendar },
  { value: 'Dumbbell', icon: Dumbbell },
  { value: 'BookOpen', icon: BookOpen },
  { value: 'Coffee', icon: Coffee },
  { value: 'Code', icon: Code },
  { value: 'User', icon: User },
  { value: 'Briefcase', icon: Target } // Fallback for briefcase, using Target as icon placeholder for now
];

export function RoutineManager() {
  const { routineTemplates, updateRoutineTemplateBlock, addRoutineTemplateBlock, deleteRoutineTemplateBlock } = useAppData();
  const [activeTab, setActiveTab] = useState('1'); // Segunda-feira by default
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduledItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [icon, setIcon] = useState('Target');

  // Load active day's blocks and sort by time
  const activeBlocks = useMemo(() => {
    const blocks = routineTemplates[activeTab] || [];
    return [...blocks].sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
  }, [routineTemplates, activeTab]);

  // Auto-seed Freelancer blocks on mount
  React.useEffect(() => {
    const seedFreelancer = async () => {
      const targetDays = ['1', '3', '6']; // Seg, Qua, Sab
      
      for (const day of targetDays) {
        const blocks = routineTemplates[day] || [];
        // Only add if it doesn't already exist for this day
        if (!blocks.some(b => b.title === 'Freelancer')) {
           const newBlock: ScheduledItem = {
              id: `freelancer-${day}-${Date.now()}`,
              originalId: `freelancer-base`,
              type: 'habit',
              title: 'Freelancer',
              icon: 'Briefcase',
              time: '18:00', // Example time
              endTime: '18:30', // 30 minutes
              templateOriginId: `freelancer-base`
            };
            await addRoutineTemplateBlock(day, newBlock);
        }
      }
    };
    
    // Only run if we actually have routineTemplates loaded (prevents seeding empty state unnecessarily if not logged in)
    if (Object.keys(routineTemplates).length > 0) {
        seedFreelancer();
    }
  }, [routineTemplates, addRoutineTemplateBlock]);

  const handleOpenModal = (block?: ScheduledItem) => {
    if (block) {
      setEditingBlock(block);
      setTitle(block.title);
      setTime(block.time || '08:00');
      setEndTime(block.endTime || '09:00');
      setIcon(block.icon || 'Target');
    } else {
      setEditingBlock(null);
      setTitle('');
      setTime('08:00');
      setEndTime('09:00');
      setIcon('Target');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title || !time || !endTime) return;
    
    if (editingBlock) {
      await updateRoutineTemplateBlock(activeTab, editingBlock.id, {
        title,
        time,
        endTime,
        icon
      });
    } else {
      const newBlock: ScheduledItem = {
        id: `routine-${Date.now()}`,
        originalId: `custom-routine`,
        type: 'habit',
        title,
        icon,
        time,
        endTime,
        templateOriginId: `custom-routine`
      };
      await addRoutineTemplateBlock(activeTab, newBlock);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (blockId: string) => {
    await deleteRoutineTemplateBlock(activeTab, blockId);
  };

  // Helper to calculate duration for UI
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMins < 0) return '';
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" /> 
            Horário Semanal
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Gere a tua rotina mestre de 7 dias. Estas alterações aplicam-se a todas as semanas.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full overflow-x-auto justify-start mb-6 h-auto p-1 bg-muted/60 hide-scrollbar rounded-lg">
          {DAYS.map(d => (
            <TabsTrigger key={d.id} value={d.id} className="py-2.5 px-4 text-sm font-medium whitespace-nowrap min-w-24">
              {d.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="border-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
          <CardHeader className="pb-4 border-b bg-card">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{DAYS.find(d => d.id === activeTab)?.label}</CardTitle>
              <Button size="sm" className="gap-1.5" onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4" /> Novo Bloco
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 bg-secondary/5 min-h-[400px]">
            {activeBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-3">
                <Clock className="h-10 w-10 opacity-20" />
                <p>Nenhuma rotina planeada para este dia.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBlocks.map(block => {
                  const IconComp = ICONS.find(i => i.value === block.icon)?.icon || Target;
                  return (
                    <div key={block.id} className="flex gap-4 relative group">
                      {/* Timeline Line & Time */}
                      <div className="flex flex-col items-center w-16 shrink-0 pt-3">
                        <span className="text-sm font-bold text-primary">{block.time}</span>
                        <div className="w-px h-full bg-primary/20 my-2 group-last:bg-transparent" />
                      </div>
                      
                      {/* Block Content */}
                      <div className="flex-1 pb-4">
                        <div className="bg-card hover:bg-card/80 transition-colors rounded-xl p-4 border border-border shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <IconComp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-base leading-none mb-1.5">{block.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="bg-muted px-2 py-0.5 rounded font-medium">{block.time} - {block.endTime}</span>
                                <span>•</span>
                                <span>{calculateDuration(block.time || '', block.endTime || '')}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(block)}>
                              <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apagar bloco de rotina?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Estás a apagar "{block.title}" da rotina de {DAYS.find(d => d.id === activeTab)?.label}. Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(block.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Apagar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Editar Bloco' : 'Adicionar Bloco à Rotina'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Nome da Tarefa / Bloco</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Deep Work (Backend)" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time">Hora de Início</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Hora de Fim</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Ícone</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleciona um ícone" />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(i => {
                    const Comp = i.icon;
                    return (
                      <SelectItem key={i.value} value={i.value}>
                        <div className="flex items-center gap-2">
                          <Comp className="h-4 w-4 text-primary" />
                          <span>{i.value}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingBlock ? 'Guardar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
