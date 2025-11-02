
"use client"

import { useForm } from 'react-hook-form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from '@/components/ui/button';
import { Day, Habit, HabitSchema } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Icon } from '../dashboard/Dashboard';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { useAppData } from '@/context/AppDataContext';

const iconList = [
  "Award", "BarChart", "Bed", "Bike", "BookOpen", "BrainCircuit", "Check", "ClipboardList", "Clock", "Coffee",
  "Contact", "Dumbbell", "Footprints", "Heart", "Leaf", "Map", "PenSquare", "Pizza", "Plane", "Repeat",
  "Scale", "Seedling", "Smile", "Sun", "Target", "Timer", "TreePine", "Trophy", "Wallet", "Wind",
] as const;

type GoalSheetProps = {
    isSheetOpen: boolean;
    setIsSheetOpen: (isOpen: boolean) => void;
    dayMapping: { id: Day; label: string }[];
    form: UseFormReturn<z.infer<typeof HabitSchema>>;
    editingHabit: Habit | null;
}

export const GoalSheet = ({ isSheetOpen, setIsSheetOpen, dayMapping, form, editingHabit }: GoalSheetProps) => {
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
          title: "Habit Saved!",
          description: `The habit "${data.name}" has been successfully created.`,
        });
      }

      setIsSheetOpen(false);
      form.reset();
    }


    return (
      <Form {...form}>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg">
          <SheetHeader className="p-6">
            <SheetTitle>{editingHabit ? 'Edit Habit' : 'Create a New Habit'}</SheetTitle>
            <SheetDescription>
              {editingHabit ? 'Update your habit details.' : "Define your new habit here. Click save when you're done."}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1">
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 p-6 pt-0">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name">Name</Label>
                  <FormControl>
                    <Input id="name" placeholder="e.g., Morning Run" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <Label>Icon</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 font-normal">
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
            
            <FormField
              control={form.control}
              name="timeOfDay"
              render={({ field }) => (
                <FormItem>
                    <Label htmlFor="timeOfDay">Time of Day</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="any">Any time</SelectItem>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
                control={form.control}
                name="goalType"
                render={({ field }) => (
                <FormItem>
                  <Label>Goal Type</Label>
                  <div className="space-y-3">
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
                        <div className="flex items-center gap-2">
                            <Input type="number" placeholder="30" className="w-20" />
                            <span>minutes</span>
                        </div>
                    )}
                    {watchGoalType === 'repetition' && (
                        <div className="flex items-center gap-2">
                            <Input type="number" placeholder="5" className="w-20" />
                            <span>times</span>
                        </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <Label>Schedule</Label>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      className="justify-start flex-wrap pt-2"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      {dayMapping.map(day => (
                        <ToggleGroupItem key={day.id} value={day.id} aria-label={`Toggle ${day.id}`}>
                          {day.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          </ScrollArea>
          <SheetFooter className="p-6 pt-0 bg-background border-t">
            <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">Save Habit</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Form>
    )
}
