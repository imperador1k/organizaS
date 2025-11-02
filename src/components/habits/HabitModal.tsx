"use client"

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Target, Clock, Calendar, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { Day, Habit, HabitSchema } from '@/lib/types';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Icon } from '../dashboard/Dashboard';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/context/AppDataContext';

const iconList = [
  "Award", "BarChart", "Bed", "Bike", "BookOpen", "BrainCircuit", "Check", "ClipboardList", "Clock", "Coffee",
  "Contact", "Dumbbell", "Footprints", "Heart", "Leaf", "Map", "PenSquare", "Pizza", "Plane", "Repeat",
  "Scale", "Seedling", "Smile", "Sun", "Target", "Timer", "TreePine", "Trophy", "Wallet", "Wind",
] as const;

const dayMapping: { id: Day; label: string }[] = [
  { id: 'Mo', label: 'M' },
  { id: 'Tu', label: 'T' },
  { id: 'We', label: 'W' },
  { id: 'Th', label: 'T' },
  { id: 'Fr', label: 'F' },
  { id: 'Sa', label: 'S' },
  { id: 'Su', label: 'S' },
];

type HabitModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  form: UseFormReturn<z.infer<typeof HabitSchema>>;
  editingHabit: Habit | null;
}

export const HabitModal = ({ isModalOpen, setIsModalOpen, form, editingHabit }: HabitModalProps) => {
  const { toast } = useToast();
  const { addHabit, updateHabit } = useAppData();
  
  const watchGoalType = form.watch('goalType');

  function onSubmit(data: z.infer<typeof HabitSchema>) {
    if (editingHabit) {
      updateHabit({ ...editingHabit, ...data });
      toast({
        title: "Habit Updated!",
        description: `The habit "${data.name}" has been successfully updated.`,
      });
    } else {
      addHabit(data);
      toast({
        title: "Habit Created!",
        description: `The habit "${data.name}" has been successfully created.`,
      });
    }

    setIsModalOpen(false);
    form.reset();
  }

  return (
    <Form {...form}>
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <ModalHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <ModalTitle className="text-xl">
                  {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                </ModalTitle>
                <ModalDescription>
                  {editingHabit ? 'Update your habit details' : 'Build a new healthy habit'}
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Habit Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Morning Run" 
                        {...field} 
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Icon */}
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Icon</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2 font-normal h-11">
                          <Icon name={field.value} />
                          {field.value}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-6 gap-1">
                          {iconList.map(iconName => (
                            <Button
                              key={iconName}
                              variant={field.value === iconName ? "default" : "outline"}
                              size="icon"
                              onClick={() => field.onChange(iconName)}
                              className="h-8 w-8"
                            >
                              <Icon name={iconName} className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Time of Day */}
              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Time of Day</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="any">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Any time</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="morning">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Morning</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="afternoon">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Afternoon</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="evening">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Evening</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Goal Type */}
              <FormField
                control={form.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Goal Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4 pt-2"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="off" id="off" />
                          </FormControl>
                          <Label htmlFor="off" className="font-normal">Off</Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="duration" id="duration" />
                          </FormControl>
                          <Label htmlFor="duration" className="font-normal">Duration</Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="repetition" id="repetition" />
                          </FormControl>
                          <Label htmlFor="repetition" className="font-normal">Repetition</Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    {watchGoalType === 'duration' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input type="number" placeholder="30" className="w-20 h-9" />
                        <span className="text-sm text-muted-foreground">minutes</span>
                      </div>
                    )}
                    {watchGoalType === 'repetition' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input type="number" placeholder="5" className="w-20 h-9" />
                        <span className="text-sm text-muted-foreground">times</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Schedule */}
              <FormField
                control={form.control}
                name="schedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Schedule</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="multiple"
                        variant="outline"
                        className="justify-start flex-wrap pt-2"
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        {dayMapping.map(day => (
                          <ToggleGroupItem key={day.id} value={day.id} aria-label={`Toggle ${day.id}`} className="h-9 w-9">
                            {day.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
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
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Form>
  );
}
