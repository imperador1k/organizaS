"use client"

import { useEffect } from 'react';
import { z } from 'zod';
import { format } from "date-fns";
import { CalendarIcon, Clock, Star, FileText, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppEvent, EventSchema } from '@/lib/types';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { UseFormReturn } from 'react-hook-form';

const importanceOptions = [
  { value: 'low', label: 'Low', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { value: 'high', label: 'High', color: 'text-red-600', bgColor: 'bg-red-50' },
] as const;

type EventModalProps = {
  form: UseFormReturn<z.infer<typeof EventSchema>>;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  editingEvent: AppEvent | null;
  onEventSubmit: (event: z.infer<typeof EventSchema>) => void;
}

export function EventModal({ form, isModalOpen, setIsModalOpen, editingEvent, onEventSubmit }: EventModalProps) {
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      form.reset();
    }
  }, [isModalOpen, form]);

  // Populate form when editing
  useEffect(() => {
    if (isModalOpen && editingEvent) {
      form.reset({
        ...editingEvent,
        date: new Date(editingEvent.date),
        // Ensure optional fields are properly set to empty strings or undefined
        time: editingEvent.time || "",
        notes: editingEvent.notes || "",
      });
    }
  }, [isModalOpen, editingEvent, form]);

  function onSubmit(data: z.infer<typeof EventSchema>) {
    // Clean up optional fields - convert empty strings to undefined
    const cleanedData = {
      ...data,
      notes: data.notes?.trim() || undefined,
      time: data.time?.trim() || undefined,
    };

    onEventSubmit(cleanedData);
    toast({
      title: editingEvent ? "Event Updated!" : "Event Created!",
      description: `The event "${data.title}" has been successfully ${editingEvent ? 'updated' : 'created'}.`,
    });
    setIsModalOpen(false);
    form.reset();
  }

  const selectedImportance = form.watch('importance');
  const importanceOption = importanceOptions.find(opt => opt.value === selectedImportance);

  return (
    <Form {...form}>
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <ModalTitle className="text-xl">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </ModalTitle>
                <ModalDescription>
                  {editingEvent ? 'Update your event details' : 'Add a new event to your schedule'}
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
                    <FormLabel className="text-sm font-medium">Event Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter event title..." 
                        {...field} 
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium">Date</FormLabel>
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

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Time (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="14:30" 
                            {...field} 
                            value={field.value || ""}
                            className="h-11 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Importance */}
              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Importance</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {importanceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Star className={cn("h-4 w-4", option.color)} />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Notes (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea 
                          placeholder="Add any additional notes..." 
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
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Form>
  );
}