import React, { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Target, Clock, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { Icon } from '@/components/dashboard/Dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScheduledItem } from '@/lib/types';

const diasDaSemana = [
  { id: '1', label: 'Segunda-feira' },
  { id: '2', label: 'Terça-feira' },
  { id: '3', label: 'Quarta-feira' },
  { id: '4', label: 'Quinta-feira' },
  { id: '5', label: 'Sexta-feira' },
  { id: '6', label: 'Sábado' },
  { id: '0', label: 'Domingo' }
];

export function RoutineTemplatesView() {
  const { routineTemplates, seedRoutineTemplates, addRoutineTemplateBlock, updateRoutineTemplateBlock, deleteRoutineTemplateBlock } = useAppData();
  const [selectedDay, setSelectedDay] = useState('1');
  const [isSeeding, setIsSeeding] = useState(false);
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduledItem | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    time: '09:00', 
    endTime: '10:00', 
    icon: 'Target',
    selectedDays: [] as string[]
  });

  const handleOpenModal = (block?: ScheduledItem) => {
    if (block) {
      setEditingBlock(block);
      setFormData({ 
        title: block.title, 
        time: block.time || '', 
        endTime: block.endTime || '', 
        icon: block.icon,
        selectedDays: [selectedDay]
      });
    } else {
      setEditingBlock(null);
      setFormData({ 
        title: '', 
        time: '09:00', 
        endTime: '10:00', 
        icon: 'Target',
        selectedDays: [selectedDay]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || formData.selectedDays.length === 0) return;
    
    if (editingBlock) {
      // Se for edição, atualizamos em todos os dias selecionados
      for (const day of formData.selectedDays) {
        // Verifica se o bloco existe neste dia
        const blocksInDay = routineTemplates[day] || [];
        const exists = blocksInDay.some(b => b.id === editingBlock.id);
        
        if (exists) {
          await updateRoutineTemplateBlock(day, editingBlock.id, {
            title: formData.title,
            time: formData.time,
            endTime: formData.endTime,
            icon: formData.icon
          });
        } else {
          // Se não existir nesse dia e o user selecionou, adiciona-o
          await addRoutineTemplateBlock(day, {
            ...editingBlock,
            title: formData.title,
            time: formData.time,
            endTime: formData.endTime,
            icon: formData.icon
          });
        }
      }
    } else {
      const newBlock: ScheduledItem = {
        id: `tpl-${Math.random().toString(36).substr(2, 9)}`,
        originalId: `tpl-orig`,
        type: 'habit',
        title: formData.title,
        time: formData.time,
        endTime: formData.endTime,
        icon: formData.icon
      };
      for (const day of formData.selectedDays) {
        await addRoutineTemplateBlock(day, newBlock);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (blockId: string) => {
    await deleteRoutineTemplateBlock(selectedDay, blockId);
  };

  const hasTemplates = Object.keys(routineTemplates).length > 0;

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedRoutineTemplates();
    } catch (error) {
      console.error("Erro ao sincronizar rotinas:", error);
    }
    setIsSeeding(false);
  };

  if (!hasTemplates) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 border rounded-xl bg-card">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Target className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Sem Rotinas Mestre Definidas</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          A tua coleção de templates base está vazia. Podes sincronizar automaticamente a rotina oficial desenhada no teu Plano Anual para o Firebase.
        </p>
        <Button size="lg" onClick={handleSeed} disabled={isSeeding} className="shadow-lg shadow-primary/20">
          {isSeeding ? "A sincronizar..." : "Sincronizar Rotina Oficial"}
        </Button>
      </div>
    );
  }

  const currentBlocks = routineTemplates[selectedDay] || [];
  // Ordenar por hora (HH:mm)
  const sortedBlocks = [...currentBlocks].sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {diasDaSemana.map(dia => (
          <Button
            key={dia.id}
            variant={selectedDay === dia.id ? "default" : "outline"}
            onClick={() => setSelectedDay(dia.id)}
            className="min-w-fit"
          >
            {dia.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Template Base: {diasDaSemana.find(d => d.id === selectedDay)?.label}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Bloco
          </Button>
        </CardHeader>
        <CardContent>
          {sortedBlocks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
              <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
              <p>Nenhum bloco definido para este dia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBlocks.map(block => (
                <div key={block.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors group">
                  <div className="p-3 rounded-md bg-primary/10">
                    <Icon name={block.icon} className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{block.title}</h4>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 font-medium bg-secondary px-3 py-1 rounded-full text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{block.time}</span>
                      {block.endTime && (
                        <>
                          <span className="text-muted-foreground mx-0.5">-</span>
                          <span>{block.endTime}</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenModal(block)}>
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação vai remover permanentemente o bloco "{block.title}" das terças-feiras (ou do dia correspondente). As instâncias já passadas não serão afetadas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(block.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Eliminar Bloco
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Qualquer edição futura a estes blocos afetará apenas os dias que ainda não foram instanciados (clonados).
        </p>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Editar Bloco Mestre' : 'Novo Bloco Mestre'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Bloco</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Deep Work" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Hora Fim</Label>
                <Input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>
            </div>
            <div className="space-y-3 pt-2 border-t">
              <Label>Aplicar aos dias:</Label>
              <div className="grid grid-cols-2 gap-2">
                {diasDaSemana.map(dia => (
                  <div key={dia.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`day-${dia.id}`}
                      checked={formData.selectedDays.includes(dia.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          selectedDays: checked 
                            ? [...prev.selectedDays, dia.id]
                            : prev.selectedDays.filter(id => id !== dia.id)
                        }))
                      }}
                    />
                    <label
                      htmlFor={`day-${dia.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {dia.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={formData.selectedDays.length === 0}>Guardar Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
