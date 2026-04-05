"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy, doc, writeBatch, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AppDataContext";
import { KanbanColumn, KanbanCard } from "@/lib/types";
import { Loader } from "@/components/Loader";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Trash, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function KanbanBoard({ pageId }: { pageId: string }) {
  const { user } = useAuth();
  const { activeWorkspaceId } = useWorkspace();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const [addingCardToColumn, setAddingCardToColumn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");

  useEffect(() => {
    if (!user || !activeWorkspaceId || !pageId) return;

    const colsRef = collection(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_columns`);
    const qCols = query(colsRef, orderBy('order', 'asc'));

    const unsubscribeCols = onSnapshot(qCols, (snapshot) => {
      const data: KanbanColumn[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as KanbanColumn);
      });
      setColumns(data);
      setLoading(false);
    });

    const cardsRef = collection(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_cards`);
    const qCards = query(cardsRef, orderBy('order', 'asc'));

    const unsubscribeCards = onSnapshot(qCards, (snapshot) => {
      const data: KanbanCard[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as KanbanCard);
      });
      setCards(data);
    });

    return () => {
      unsubscribeCols();
      unsubscribeCards();
    };
  }, [user, activeWorkspaceId, pageId]);

  const handleAddColumn = async () => {
    if (!user || !activeWorkspaceId || !pageId || !newColumnName.trim()) return;
    try {
      const colsRef = collection(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_columns`);
      await addDoc(colsRef, {
        name: newColumnName.trim(),
        order: columns.length,
      });
      setNewColumnName("");
      setIsAddingColumn(false);
    } catch (e) {
      console.error("Error adding column: ", e);
    }
  };

  const handleDeleteColumn = async (colId: string) => {
    if (!user || !activeWorkspaceId || !pageId) return;
    try {
      const batch = writeBatch(db);
      
      const colRef = doc(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_columns/${colId}`);
      batch.delete(colRef);

      const cardsInCol = cards.filter(c => c.columnId === colId);
      for (const card of cardsInCol) {
        const cardRef = doc(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_cards/${card.id}`);
        batch.delete(cardRef);
      }
      
      await batch.commit();
    } catch (e) {
      console.error("Error deleting column: ", e);
    }
  };

  const handleAddCard = async () => {
    if (!user || !activeWorkspaceId || !pageId || !addingCardToColumn || !newCardTitle.trim()) return;
    try {
      const cardsInCol = cards.filter(c => c.columnId === addingCardToColumn);
      const cardsRef = collection(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_cards`);
      await addDoc(cardsRef, {
        title: newCardTitle.trim(),
        description: newCardDescription.trim(),
        columnId: addingCardToColumn,
        order: cardsInCol.length,
      });
      setNewCardTitle("");
      setNewCardDescription("");
      setAddingCardToColumn(null);
    } catch (e) {
      console.error("Error adding card: ", e);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !user || !activeWorkspaceId) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;

    const batch = writeBatch(db);

    if (sourceColumnId === destColumnId) {
      const columnCards = cards.filter(c => c.columnId === sourceColumnId).sort((a,b) => a.order - b.order);
      const [movedCard] = columnCards.splice(source.index, 1);
      columnCards.splice(destination.index, 0, movedCard);

      columnCards.forEach((c, i) => {
        const cardRef = doc(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_cards/${c.id}`);
        batch.update(cardRef, { order: i });
      });
    } else {
      const sourceCards = cards.filter(c => c.columnId === sourceColumnId).sort((a,b) => a.order - b.order);
      const destCards = cards.filter(c => c.columnId === destColumnId).sort((a,b) => a.order - b.order);
      
      const movedCardIndex = sourceCards.findIndex(c => c.id === draggableId);
      if(movedCardIndex !== -1) {
        const [movedCard] = sourceCards.splice(movedCardIndex, 1);
        destCards.splice(destination.index, 0, movedCard);
        
        sourceCards.forEach((c, i) => {
          const cardRef = doc(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_cards/${c.id}`);
          batch.update(cardRef, { order: i });
        });
        
        destCards.forEach((c, i) => {
          const cardRef = doc(db, `users/${user.uid}/workspaces/${activeWorkspaceId}/pages/${pageId}/kanban_cards/${c.id}`);
          batch.update(cardRef, { order: i, columnId: destColumnId });
        });
      }
    }

    try {
      await batch.commit();
    } catch (e) {
      console.error("Error reordering: ", e);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="h-full w-full flex gap-4 md:gap-6 overflow-x-auto pb-6 items-start snap-x snap-mandatory">       
          {columns.map(col => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-[280px] md:w-[320px] shrink-0 bg-muted/40 rounded-xl p-3 flex flex-col max-h-[calc(100vh-10rem)] border border-border/50 shadow-sm snap-center"
                >
                  <div className="flex items-center justify-between mb-3 group/col px-1">
                    <h3 className="font-semibold text-[13px] uppercase tracking-wider flex items-center text-foreground/80">
                      <span>{col.name}</span>
                      <span className="ml-2 bg-background border shadow-sm px-2 py-0.5 rounded-full text-[10px] tabular-nums text-muted-foreground">
                        {cards.filter(c => c.columnId === col.id).length}
                      </span>
                    </h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/col:opacity-100 transition-opacity hover:bg-destructive/10" onClick={() => handleDeleteColumn(col.id)}>
                      <Trash className="w-3.5 h-3.5 text-destructive/70 hover:text-destructive" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[10px] scrollbar-thin">
                    {cards
                      .filter(c => c.columnId === col.id)
                      .sort((a,b) => a.order - b.order)
                      .map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-background group/card p-3.5 rounded-lg shadow-sm border border-border/60 hover:border-primary/40 hover:shadow transition-all relative overflow-hidden" 
                          >
                            <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity cursor-grab text-muted-foreground/30 hover:text-muted-foreground">
                              <GripHorizontal className="w-4 h-4" />
                            </div>
                            <p className="text-sm font-medium pr-5 text-foreground leading-snug">{card.title}</p> 
                            {card.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{card.description}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  <button 
                    onClick={() => setAddingCardToColumn(col.id)}
                    className="w-full mt-3 text-left text-sm font-medium text-muted-foreground hover:text-primary py-2 px-3 rounded-lg hover:bg-background/80 transition-colors flex items-center justify-between group shadow-sm border border-transparent hover:border-border/50">
                    <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Card</span>
                  </button>
                </div>
              )}
            </Droppable>
          ))}
          
          <div className="w-[280px] md:w-[320px] shrink-0 snap-center pb-4">
            {!isAddingColumn ? (
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-start gap-2 h-12 bg-muted/20 hover:bg-muted/50 border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground transition-all rounded-xl"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="w-4 h-4" /> Add Column
              </Button>
            ) : (
              <div className="bg-muted/40 p-3 rounded-xl border border-border/50 shadow-sm flex flex-col gap-2">
                <Input 
                  autoFocus 
                  value={newColumnName} 
                  onChange={e => setNewColumnName(e.target.value)} 
                  placeholder="Column title..." 
                  className="bg-background border-border/50"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') { setIsAddingColumn(false); setNewColumnName(''); }
                  }}
                />
                <div className="flex justify-end gap-2 mt-1">
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => { setIsAddingColumn(false); setNewColumnName(''); }}>Cancel</Button>
                  <Button size="sm" className="h-8" onClick={handleAddColumn}>Add</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>

      <Dialog open={!!addingCardToColumn} onOpenChange={(open) => { if(!open) setAddingCardToColumn(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                autoFocus 
                value={newCardTitle} 
                onChange={e => setNewCardTitle(e.target.value)} 
                placeholder="Task title" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input 
                value={newCardDescription} 
                onChange={e => setNewCardDescription(e.target.value)} 
                placeholder="Add more details..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingCardToColumn(null)}>Cancel</Button>
            <Button onClick={handleAddCard}>Create Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

