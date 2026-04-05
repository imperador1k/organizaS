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
        <div className="h-full w-full flex space-x-6 overflow-x-auto pb-4 items-start">       
          {columns.map(col => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-80 shrink-0 bg-muted/20 rounded-xl p-4 flex flex-col max-h-full border border-border/40"
                >
                  <div className="flex items-center justify-between mb-4 text-muted-foreground group/col">
                    <h3 className="font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                      <GripHorizontal className="w-4 h-4 opacity-50" />
                      <span>{col.name}</span>
                      <span className="bg-muted px-2 rounded-full text-xs">{cards.filter(c => c.columnId === col.id).length}</span>
                    </h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover/col:opacity-100" onClick={() => handleDeleteColumn(col.id)}>
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[10px]">
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
                            className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border border-border/50 hover:border-primary/50 transition-colors" 
                          >
                            <p className="text-sm font-medium">{card.title}</p> 
                            {card.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{card.description}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  <button 
                    onClick={() => setAddingCardToColumn(col.id)}
                    className="w-full mt-4 text-left text-sm text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Card</span>
                  </button>
                </div>
              )}
            </Droppable>
          ))}
          
          <div className="w-80 shrink-0">
            {!isAddingColumn ? (
              <Button 
                variant="outline" 
                className="w-full border-dashed flex items-center justify-start gap-2 h-12 bg-muted/20"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="w-4 h-4" /> Add Column
              </Button>
            ) : (
              <div className="bg-card p-3 rounded-xl border shadow-sm flex flex-col gap-2">
                <Input 
                  autoFocus 
                  value={newColumnName} 
                  onChange={e => setNewColumnName(e.target.value)} 
                  placeholder="Column title..." 
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') { setIsAddingColumn(false); setNewColumnName(''); }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setIsAddingColumn(false); setNewColumnName(''); }}>Cancel</Button>
                  <Button size="sm" onClick={handleAddColumn}>Add</Button>
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

