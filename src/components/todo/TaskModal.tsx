"use client"

import { useFieldArray } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2, Clock, FileText, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskSchema } from '@/lib/types';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { UseFormReturn } from 'react-hook-form';

const taskCategories = [
  { value: 'work', label: 'Work', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'personal', label: 'Personal', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'wishlist', label: 'Wishlist', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { value: 'birthday', label: 'Birthday', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { value: 'other', label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-50' },
] as const;

type TaskModalProps = {
  form: UseFormReturn<z.infer<typeof TaskSchema>>;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onTaskSubmit: (task: z.infer<typeof TaskSchema>) => void;
  editingTask: Task | null;
}

export function TaskModal({ form, isModalOpen, setIsModalOpen, onTaskSubmit, editingTask }: TaskModalProps) {
  const { toast } = useToast();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks"
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      form.reset();
    }
  }, [isModalOpen, form]);

  // Populate form when editing
  useEffect(() => {
    if (isModalOpen && editingTask) {
      form.reset({
        ...editingTask,
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : undefined,
        // Ensure optional fields are properly set to empty strings or undefined
        description: editingTask.description || "",
        notes: editingTask.notes || "",
        time: editingTask.time || "",
        attachmentUrl: editingTask.attachmentUrl || "",
      });
    }
  }, [isModalOpen, editingTask, form]);

  function onSubmit(data: z.infer<typeof TaskSchema>) {
    // For creation, ensure dueDate is set
    if (!editingTask && !data.dueDate) {
      form.setError("dueDate", {
        type: "manual",
        message: "Due date is required."
      });
      return;
    }
    
    // Clean up optional fields - convert empty strings to undefined
    const cleanedData: any = {
      ...data,
      description: data.description?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      attachmentUrl: data.attachmentUrl?.trim() || undefined,
      time: data.time?.trim() || undefined,
    };

    // Handle subtasks correctly
    if (data.subtasks) {
      cleanedData.subtasks = data.subtasks.filter((subtask: any) => 
        subtask.value?.trim() !== ''
      ).map((subtask: any) => ({
        value: subtask.value?.trim() || ""
      }));
    }

    onTaskSubmit(cleanedData);
    toast({
      title: editingTask ? "Task Updated!" : "Task Created!",
      description: `The task "${data.title}" has been successfully ${editingTask ? 'updated' : 'created'}.`,
    });
    setIsModalOpen(false);
    form.reset();
  }

  const selectedCategory = form.watch('category');
  const categoryOption = taskCategories.find(cat => cat.value === selectedCategory);

  return (
    <Form {...form}>
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <ModalHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <ModalTitle className="text-xl">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </ModalTitle>
                <ModalDescription>
                  {editingTask ? 'Update your task details' : 'Add a new task to your list'}
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Task Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter task title..." 
                        {...field} 
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea 
                          placeholder="Add a description..." 
                          {...field} 
                          value={field.value || ""}
                          className="pl-10 min-h-[80px] resize-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", category.bgColor)} />
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">
                      {editingTask ? "Due Date (Optional)" : "Due Date"}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-11 pl-3 text-left font-normal",
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
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subtasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">Subtasks (Optional)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: "" })}
                    className="h-8"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`subtasks.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="Enter subtask..." 
                              {...field} 
                              value={field.value || ""}
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-9 w-9 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes..." 
                        {...field} 
                        value={field.value || ""}
                        className="min-h-[80px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ModalFooter className="gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Form>
  );
}