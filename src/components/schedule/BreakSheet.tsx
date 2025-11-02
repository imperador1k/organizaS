
"use client"

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Break, BreakSchema } from '@/lib/types';
import { useAppData } from '@/context/AppDataContext';
import { Icon } from '../dashboard/Dashboard';

const iconList = [
    "Coffee", "CupSoda", "Pizza", "Sandwich", "Book", "Youtube", "Gamepad2", "Moon", "Bed"
] as const;

type BreakSheetProps = {
    form: ReturnType<typeof useForm<z.infer<typeof BreakSchema>>>;
    isSheetOpen: boolean;
    setIsSheetOpen: (isOpen: boolean) => void;
    editingBreak: Break | null;
    selectedDate: Date;
}

export function BreakSheet({ form, isSheetOpen, setIsSheetOpen, editingBreak, selectedDate }: BreakSheetProps) {
    const { toast } = useToast();
    const { addBreak, updateBreak } = useAppData();

    function onSubmit(data: z.infer<typeof BreakSchema>) {
        const breakData = { ...data, date: selectedDate };
        if (editingBreak) {
            updateBreak({ ...editingBreak, ...breakData });
            toast({
                title: "Break Updated!",
                description: `The break "${data.title}" has been successfully updated.`,
            });
        } else {
            addBreak(breakData);
            toast({
                title: "Break Saved!",
                description: `The break "${data.title}" has been successfully created.`,
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
              <SheetTitle>{editingBreak ? 'Edit Break' : 'Create a New Break'}</SheetTitle>
              <SheetDescription>
                {editingBreak ? 'Update the details for your break.' : "Define a new break for your schedule."}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 p-6 pt-0">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'Lunch Break'" {...field} />
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
                            <Icon name={field.value || 'Coffee'} />
                            {field.value || 'Coffee'}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </ScrollArea>
            <SheetFooter className="p-6 pt-0 bg-background border-t">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Save Break</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Form>
    )
}
