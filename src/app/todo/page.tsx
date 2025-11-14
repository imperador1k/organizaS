'use client';

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Archive, ArrowLeft, CheckCircle, CalendarIcon, Paperclip, FileText, Undo2, Edit, Trash2, Tag, ListTree } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { TaskModal } from "@/components/todo/TaskModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task, TaskSchema } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subDays, isToday, isYesterday, isWithinInterval, isAfter, startOfDay, format } from 'date-fns';
import { useAppData } from "@/context/AppDataContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type TaskWithDetails = Task & { description?: string, notes?: string };

const taskCategories = [
  { value: 'work', label: 'Work', color: 'text-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { value: 'personal', label: 'Personal', color: 'text-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
  { value: 'wishlist', label: 'Wishlist', color: 'text-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  { value: 'birthday', label: 'Birthday', color: 'text-pink-600', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
  { value: 'escola', label: 'Escola', color: 'text-indigo-600', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
  { value: 'other', label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20' },
] as const;

const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'last90days', label: 'Last 90 days' },
    { value: 'last365days', label: 'Last Year' },
];

export default function ToDoPage() {
  const { tasks, addTask, updateTask, deleteTask } = useAppData();
  const [viewCompleted, setViewCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [completedFilter, setCompletedFilter] = useState('all');

  const { todayTasks, upcomingTasks, completedTasks } = useMemo(() => {
    const today = startOfDay(new Date());
    const active = tasks.filter(t => !t.completionDate);
    return {
        todayTasks: active.filter(t => t.dueDate && isToday(t.dueDate)),
        upcomingTasks: active.filter(t => t.dueDate && isAfter(t.dueDate, today) && !isToday(t.dueDate)),
        completedTasks: tasks.filter(t => !!t.completionDate).sort((a,b) => b.completionDate!.getTime() - a.completionDate!.getTime()),
    }
  }, [tasks]);


  const form = useForm<z.infer<typeof TaskSchema>>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "personal",
      dueDate: undefined, // Changed to undefined for editing
      time: "",
      subtasks: [],
      attachmentUrl: "",
      notes: "",
    },
  });
  
  const handleTaskCompletion = (task: Task) => {
    updateTask({ ...task, completionDate: new Date() });
  };

  const handleTaskReversion = (task: Task) => {
    const { completionDate, ...rest } = task;
    updateTask({...rest, completionDate: undefined});
  };
  
  const handleCreateNew = () => {
    setEditingTask(null);
    form.reset({
      title: "",
      description: "",
      category: "personal",
      dueDate: undefined, // Changed to undefined
      time: "",
      subtasks: [],
      attachmentUrl: "",
      notes: "",
    });
    setIsModalOpen(true);
  };
  
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    // Don't reset here - let the TaskSheet handle it via useEffect
    setIsModalOpen(true);
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  const filteredCompletedTasks = completedTasks.filter(task => {
    if (!task.completionDate) return false;
    const now = new Date();
    switch (completedFilter) {
      case 'today':
        return isToday(task.completionDate);
      case 'yesterday':
        return isYesterday(task.completionDate);
      case 'last7days':
        return isWithinInterval(task.completionDate, { start: subDays(now, 7), end: now });
      case 'last30days':
        return isWithinInterval(task.completionDate, { start: subDays(now, 30), end: now });
      case 'last90days':
          return isWithinInterval(task.completionDate, { start: subDays(now, 90), end: now });
      case 'last365days':
            return isWithinInterval(task.completionDate, { start: subDays(now, 365), end: now });
      case 'all':
      default:
        return true;
    }
  });

  const getCategoryInfo = (category: string) => {
    return taskCategories.find(cat => cat.value === category) || taskCategories[5]; // default to 'other'
  };

  const TaskCard = ({task, source}: {task: TaskWithDetails, source: 'today' | 'upcoming'}) => {
    const categoryInfo = getCategoryInfo(task.category);

    return (
     <Dialog key={task.id}>
        <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-secondary/60 transition-colors group">
            <div className="flex items-center gap-4 pt-1">
              <Checkbox 
                  id={`${task.id}-check`}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTimeout(() => handleTaskCompletion(task), 300);
                    }
                  }}
              />
            </div>
            <DialogTrigger asChild>
                <div className="grid gap-1.5 flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <label className="font-semibold cursor-pointer">
                        {task.title}
                      </label>
                      <div className={cn("text-xs px-2 py-0.5 rounded-full border", categoryInfo.bgColor, categoryInfo.borderColor, categoryInfo.color)}>
                        {categoryInfo.label}
                      </div>
                    </div>
                    {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                </div>
            </DialogTrigger>
            <div className="flex items-center gap-1">
              {task.attachmentUrl && <Paperclip className="h-5 w-5 text-muted-foreground" />}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(task)}>
                  <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the task "{task.title}".
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(task.id!)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </div>
        </div>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
              {task.description && <DialogDescription>{task.description}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-6 py-4">
              <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Category:</span>
                      <Badge variant="secondary" className="capitalize">{task.category}</Badge>
                  </div>
                  {task.dueDate && (
                      <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Due:</span>
                          <Badge variant="outline">{format(new Date(task.dueDate), 'PPP')}</Badge>
                      </div>
                  )}
              </div>
              
              <Separator />

              {task.subtasks && task.subtasks.length > 0 && (
                  <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                          <ListTree className="h-5 w-5 text-muted-foreground" />
                          Subtasks
                      </h3>
                      <div className="space-y-2 pl-7">
                          {task.subtasks.map((sub, index) => (
                              <div key={index} className="flex items-center gap-2">
                                  <Checkbox id={`sub-${index}`} disabled />
                                  <label htmlFor={`sub-${index}`} className="text-sm text-muted-foreground">{(sub as any).value}</label>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {task.notes && (
                  <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          Notes
                      </h3>
                      <p className="text-sm text-muted-foreground pl-7">{task.notes}</p>
                  </div>
              )}

              {task.attachmentUrl && (
                  <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                          Attachment
                      </h3>
                      <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                          <Image src={task.attachmentUrl} alt={`Attachment for ${task.title}`} fill style={{ objectFit: 'cover' }} data-ai-hint="attachment image"/>
                      </div>
                  </div>
              )}
          </div>
        </DialogContent>
    </Dialog>
  );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">{viewCompleted ? 'Completed Tasks' : 'To-Do List'}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewCompleted(!viewCompleted)}>
                {viewCompleted ? (
                <>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Active Tasks
                </>
                ) : (
                <>
                    <Archive className="mr-2 h-4 w-4" />
                    View Completed
                </>
                )}
            </Button>
          </div>
        </div>

        {viewCompleted ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>All Completed</CardTitle>
                  <Select value={completedFilter} onValueChange={setCompletedFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Filter tasks" />
                      </SelectTrigger>
                      <SelectContent>
                          {filterOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredCompletedTasks.map(task => {
                const categoryInfo = getCategoryInfo(task.category);
                return (
                  <div key={task.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                    <CheckCircle className="mt-1 h-5 w-5 text-success" />
                    <div className="grid gap-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold line-through text-muted-foreground">
                          {task.title}
                        </span>
                        <div className={cn("text-xs px-2 py-0.5 rounded-full border", categoryInfo.bgColor, categoryInfo.borderColor, categoryInfo.color)}>
                          {categoryInfo.label}
                        </div>
                      </div>
                      {task.description && <p className="text-sm text-muted-foreground/80">{task.description}</p>}
                      {task.completionDate && <p className="text-xs text-muted-foreground/60">Completed on: {new Date(task.completionDate).toLocaleDateString()}</p>}
                    </div>
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleTaskReversion(task)}>
                          <Undo2 className="h-4 w-4" />
                          <span className="sr-only">Revert task</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the task "{task.title}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(task.id!)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </div>
                );
              })}
              {filteredCompletedTasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No completed tasks match this filter.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Today</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayTasks.map(task => (
                    <TaskCard key={task.id} task={task} source="today" />
                  ))}
                  {todayTasks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No tasks for today.</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingTasks.map(task => (
                     <TaskCard key={task.id} task={task} source="upcoming" />
                  ))}
                  {upcomingTasks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No upcoming tasks.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            <Button
              onClick={handleCreateNew}
              className="fixed bottom-24 right-6 md:bottom-10 md:right-10 h-16 w-16 rounded-full bg-success text-success-foreground shadow-lg hover:bg-success/90"
              size="icon"
            >
              <Plus className="h-8 w-8" />
              <span className="sr-only">Add new task</span>
            </Button>
          </>
        )}
      </div>
      <TaskModal
        form={form}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onTaskSubmit={(data) => {
            // For creation, ensure dueDate is set
            if (!editingTask && !data.dueDate) {
                form.setError("dueDate", {
                    type: "manual",
                    message: "Due date is required."
                });
                return;
            }
            
            if (editingTask) {
                updateTask({ ...editingTask, ...data });
            } else {
                addTask(data);
            }
        }}
        editingTask={editingTask}
      />
    </AppLayout>
  );
}