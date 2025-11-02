

'use client';

import { useState } from 'react';
import { AppLayout } from "@/components/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical, Plus } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Day, TimeOfDay, Habit, HabitSchema } from '@/lib/types';
import { Icon } from '@/components/dashboard/Dashboard';
import { HabitModal } from '@/components/habits/HabitModal';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppData } from '@/context/AppDataContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const dayMapping: { id: Day; label: string }[] = [
    { id: 'Mo', label: 'M' },
    { id: 'Tu', label: 'T' },
    { id: 'We', label: 'W' },
    { id: 'Th', label: 'T' },
    { id: 'Fr', label: 'F' },
    { id: 'Sa', label: 'S' },
    { id: 'Su', label: 'S' },
];

export default function HabitsPage() {
  const { habits, deleteHabit } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [filter, setFilter] = useState<TimeOfDay | 'all'>('all');

  const form = useForm<z.infer<typeof HabitSchema>>({
    resolver: zodResolver(HabitSchema),
    defaultValues: {
      name: '',
      icon: 'Smile',
      timeOfDay: 'any',
      goalType: 'off',
      schedule: [],
    },
  });

  const handleCreateNew = () => {
    setEditingHabit(null);
    form.reset({
      name: '',
      icon: 'Smile',
      timeOfDay: 'any',
      goalType: 'off',
      schedule: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    form.reset(habit);
    setIsModalOpen(true);
  };

  const handleDelete = (habitId: string) => {
    deleteHabit(habitId);
  };

  const filteredHabits = habits.filter(habit => {
    if (filter === 'all') return true;
    if (filter === 'any') return habit.timeOfDay === 'any';
    return habit.timeOfDay === filter;
  });


  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">Your Habits</h1>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as TimeOfDay | 'all')} className="w-full">
          <TabsList className="border-b-2 border-border/50 rounded-none w-full justify-start gap-4 bg-transparent p-0">
            <TabsTrigger value="all" className="rounded-none bg-transparent shadow-none px-0 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-bold transition-none">All</TabsTrigger>
            <TabsTrigger value="morning" className="rounded-none bg-transparent shadow-none px-0 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-bold transition-none">Morning</TabsTrigger>
            <TabsTrigger value="afternoon" className="rounded-none bg-transparent shadow-none px-0 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-bold transition-none">Afternoon</TabsTrigger>
            <TabsTrigger value="evening" className="rounded-none bg-transparent shadow-none px-0 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-bold transition-none">Evening</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHabits.map((habit) => {
            return (
              <Card key={habit.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                       <Icon name={habit.icon} className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{habit.name}</CardTitle>
                      </div>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(habit)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to delete this habit?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the habit "{habit.name}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(habit.id!)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex gap-1">
                    {dayMapping.map(day => (
                      <Badge key={day.id} variant={habit.schedule.includes(day.id) ? 'default' : 'outline'} className="w-8 h-8 flex items-center justify-center">
                        {day.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {filteredHabits.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No habits found for this filter.</p>
          </div>
        )}
      </div>

       <Button
            onClick={handleCreateNew}
            className="fixed bottom-24 right-6 md:bottom-10 md:right-10 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-40"
            size="icon"
        >
            <Plus className="h-8 w-8" />
            <span className="sr-only">Add new habit</span>
      </Button>

       <HabitModal 
        form={form}
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        editingHabit={editingHabit}
      />
    </AppLayout>
  );
}
