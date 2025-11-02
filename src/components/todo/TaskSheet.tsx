
"use client"

import { useFieldArray } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskSchema } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { UseFormReturn } from 'react-hook-form';

const taskCategories = [
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'wishlist', label: 'Wishlist' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'other', label: 'Other' },
] as const;

type TaskSheetProps = {
    form: UseFormReturn<z.infer<typeof TaskSchema>>;
    isSheetOpen: boolean;
    setIsSheetOpen: (isOpen: boolean) => void;
    onTaskSubmit: (task: z.infer<typeof TaskSchema>) => void;
    editingTask: Task | null;
}

export function TaskSheet({ form, isSheetOpen, setIsSheetOpen, onTaskSubmit, editingTask }: TaskSheetProps) {
    const { toast } = useToast();
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "subtasks",
    });

    // Reset form when sheet closes or when switching between create/edit modes
    useEffect(() => {
        if (!isSheetOpen) {
            // Clear form when sheet closes
            form.reset({
                title: "",
                description: "",
                category: "personal",
                dueDate: new Date(),
                time: "",
                subtasks: [],
                attachmentUrl: "",
                notes: "",
            });
        }
    }, [isSheetOpen, form]);

    // Handle editing task data population
    useEffect(() => {
        if (editingTask && isSheetOpen) {
            form.reset({
                title: editingTask.title || "",
                description: editingTask.description || "",
                category: editingTask.category || "personal",
                dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : new Date(),
                time: editingTask.time || "",
                subtasks: editingTask.subtasks || [],
                attachmentUrl: editingTask.attachmentUrl || "",
                notes: editingTask.notes || "",
            });
        }
    }, [editingTask, isSheetOpen, form]);

    function onSubmit(data: z.infer<typeof TaskSchema>) {
      // Clean up empty optional fields
      const cleanedData = {
        ...data,
        description: data.description?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        attachmentUrl: data.attachmentUrl?.trim() || undefined,
        time: data.time?.trim() || undefined,
        subtasks: data.subtasks?.filter(st => st.value.trim() !== '') || [],
      };

      onTaskSubmit(cleanedData);
      toast({
        title: editingTask ? "Task Updated!" : "Task Saved!",
        description: `The task "${data.title}" has been successfully ${editingTask ? 'updated' : 'created'}.`,
      });
      setIsSheetOpen(false);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.includes('image')) {
            return toast({
                variant: 'destructive',
                title: 'Invalid file type',
                description: 'Please upload an image file.',
            });
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            fieldChange(result);
        };
    };

    return (
      <Form {...form}>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg">
            <SheetHeader className="p-6">
              <SheetTitle>{editingTask ? 'Edit Task' : 'Create a New Task'}</SheetTitle>
              <SheetDescription>
                {editingTask ? 'Update the details of your task.' : "Fill in the details for your new task. Click save when you're done."}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 p-6 pt-0">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'Finish project proposal'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                         <Textarea 
                           placeholder="Add a short description for your task..." 
                           {...field}
                           value={field.value || ""}
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taskCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                         <Textarea 
                           placeholder="Add any relevant notes for this task..." 
                           {...field}
                           value={field.value || ""}
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attachmentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachment (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, field.onChange)}
                            className="file:text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <FormLabel>Subtasks</FormLabel>
                        <Button type="button" size="sm" variant="ghost" onClick={() => append({ value: "" })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Subtask
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name={`subtasks.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input 
                                                    placeholder={`Subtask ${index + 1}`} 
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         {fields.length === 0 && (
                            <p className="text-sm text-center text-muted-foreground bg-secondary/50 rounded-md p-4">No subtasks yet.</p>
                         )}
                    </div>
                </div>

              </form>
            </ScrollArea>
            <SheetFooter className="p-6 pt-0 bg-background border-t">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Save Task</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Form>
    )
}
