

"use client"

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventSchema, AppEvent } from '@/lib/types';
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
import { Icon } from '../dashboard/Dashboard';

const importanceLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
] as const;

const iconList = [
  "AlarmClock", "Anchor", "Award", "Backpack", "BadgeCheck", "Banknote", "Bell", "Bike", "Bitcoin", "Bone", "Book", "Briefcase", "Cake", "Camera", "Car", "Carrot", "Church", "CircleUser", "Clipboard", "Coffee", "Cog", "ConciergeBell", "CupSoda", "Diamond", "Dumbbell", "FerrisWheel", "File", "Film", "Flag", "Flame", "Gamepad2", "Gem", "Gift", "GraduationCap", "Handshake", "Heart", "HelpCircle", "Home", "Landmark", "Laptop", "Laugh", "Lightbulb", "MapPin", "MessageCircle", "Mic", "Music", "Palette", "PartyPopper", "PawPrint", "Pen", "Phone", "Pizza", "Plane", "Plug", "Plus", "Rocket", "Scale", "School", "Scissors", "Settings", "Shield", "ShoppingBag", "ShoppingBasket", "ShoppingCart", "Shovel", "Spade", "Sparkles", "Star", "Stethoscope", "Suitcase", "Sun", "Sunset", "Swords", "Tag", "Ticket", "Train", "Trash2", "TreePalm", "Trophy", "Tv", "Umbrella", "Utensils", "Wallet", "Watch", "Wrench"
] as const;

type EventSheetProps = {
    form: ReturnType<typeof useForm<z.infer<typeof EventSchema>>>;
    isSheetOpen: boolean;
    setIsSheetOpen: (isOpen: boolean) => void;
    editingEvent: AppEvent | null;
    onEventSubmit: (event: z.infer<typeof EventSchema>) => void;
}

export function EventSheet({ form, isSheetOpen, setIsSheetOpen, editingEvent, onEventSubmit }: EventSheetProps) {
    const { toast } = useToast();

    function onSubmit(data: z.infer<typeof EventSchema>) {
      onEventSubmit(data);
      toast({
          title: editingEvent ? "Event Updated!" : "Event Saved!",
          description: `The event "${data.title}" has been successfully ${editingEvent ? 'updated' : 'created'}.`,
      });
      setIsSheetOpen(false);
      form.reset();
    }

    return (
      <Form {...form}>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg">
            <SheetHeader className="p-6">
              <SheetTitle>{editingEvent ? 'Edit Event' : 'Create a New Event'}</SheetTitle>
              <SheetDescription>
                {editingEvent ? 'Update the details for your event.' : "Fill in the details for your new event. Click save when you're done."}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 p-6 pt-0">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'Dentist Appointment'" {...field} />
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
                      <FormLabel>Icon</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                            <Icon name={field.value} />
                            {field.value}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[340px] p-2">
                          <ScrollArea className="h-64">
                            <div className="grid grid-cols-8 gap-1">
                              {iconList.map(iconName => (
                                <Button
                                  key={iconName}
                                  variant={field.value === iconName ? "default" : "outline"}
                                  size="icon"
                                  onClick={() => field.onChange(iconName)}
                                  className="w-10 h-10"
                                >
                                  <Icon name={iconName} className="h-4 w-4" />
                                </Button>
                              ))}
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
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
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={field.onChange}
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
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="importance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Importance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select importance level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {importanceLevels.map(level => (
                            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                         <Textarea placeholder="Add any relevant notes for this event..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </ScrollArea>
            <SheetFooter className="p-6 pt-0 bg-background border-t">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Save Event</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Form>
    )
}
