

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, addHours, startOfDay, isToday, parse, set, getMinutes, getHours } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { AppLayout } from "@/components/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, GripVertical, LayoutGrid, List, Clock, X, PlusCircle, Edit, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/dashboard/Dashboard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppData } from '@/context/AppDataContext';
import { ScheduledItem, Break, BreakSchema } from '@/lib/types';
import { BreakSheet } from '@/components/schedule/BreakSheet';
import { TimeModal } from '@/components/schedule/TimeModal';
import { ScheduleItemModal } from '@/components/schedule/ScheduleItemModal';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const dayMapping = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type PlannerColumns = {
    morning: ScheduledItem[];
    afternoon: ScheduledItem[];
    evening: ScheduledItem[];
};

const getPlannerBucket = (time: string | undefined): keyof PlannerColumns | null => {
    if (!time) return null;
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 || hour < 5) return 'evening';
    return null;
}


export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'timeline' | 'planner' | 'timeline-view'>('timeline');
  const { habits, tasks, events, breaks, updateScheduledItemTime, duplicateScheduledItem, deleteBreak } = useAppData();

  const [unscheduled, setUnscheduled] = useState<ScheduledItem[]>([]);
  const [scheduledItems, setScheduledItems] = useState<Record<string, ScheduledItem[]>>({});
  const [plannerColumns, setPlannerColumns] = useState<PlannerColumns>({ morning: [], afternoon: [], evening: [] });
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [itemToSchedule, setItemToSchedule] = useState<ScheduledItem | null>(null);
  const [timeValue, setTimeValue] = useState('');
  const [endTimeValue, setEndTimeValue] = useState('');
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);

  // State for ScheduleItemModal (alternative to drag and drop)
  const [isScheduleItemModalOpen, setIsScheduleItemModalOpen] = useState(false);
  const [scheduleModalDefaultTime, setScheduleModalDefaultTime] = useState<string>('');

  // State for BreakSheet
  const [isBreakSheetOpen, setIsBreakSheetOpen] = useState(false);
  const [editingBreak, setEditingBreak] = useState<Break | null>(null);

  const breakForm = useForm<z.infer<typeof BreakSchema>>({
    resolver: zodResolver(BreakSchema),
  });

  const hourlySlots = useMemo(() => {
    const start = startOfDay(selectedDate);
    return Array.from({ length: 24 }, (_, i) => addHours(start, i));
  }, [selectedDate]);
  
  const dailyBreaks = useMemo(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    return breaks.filter(b => format(b.date, 'yyyy-MM-dd') === selectedDateStr);
  }, [breaks, selectedDate]);

  const loadItemsForDate = useCallback(() => {
    const allItemsForDay: ScheduledItem[] = [];
    const dayOfWeek = dayMapping[selectedDate.getDay()] as 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    habits.forEach(habit => {
      if (habit.schedule.includes(dayOfWeek)) {
        const scheduleTime = habit.schedule_time?.[selectedDateStr];
        if (scheduleTime) {
          // Always treat as array for consistency
          let timesArray: string[];
          if (Array.isArray(scheduleTime)) {
            timesArray = scheduleTime;
          } else {
            // Convert single time to array
            timesArray = [scheduleTime];
          }
          
          // Create an item for each time
          timesArray.forEach((time, index) => {
            allItemsForDay.push({ 
                id: `${habit.id}-${selectedDateStr}-${index}`, 
                originalId: habit.id!,
                type: 'habit', 
                title: habit.name, 
                icon: habit.icon,
                time: time
            });
          });
        } else {
          // If no specific time, add to unscheduled
          allItemsForDay.push({ 
              id: `${habit.id}-${selectedDateStr}`, 
              originalId: habit.id!,
              type: 'habit', 
              title: habit.name, 
              icon: habit.icon,
              time: undefined
          });
        }
      }
    });

    tasks.forEach(task => {
        if (task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === selectedDateStr && !task.completionDate) {
            allItemsForDay.push({ 
                id: task.id!, 
                originalId: task.id!,
                type: 'task', 
                title: task.title, 
                icon: 'ClipboardCheck',
                time: task.time,
                endTime: task.endTime
            });
      }
    });
    
    events.forEach(event => {
       if (format(event.date, 'yyyy-MM-dd') === selectedDateStr) {
        allItemsForDay.push({ 
            id: event.id!, 
            originalId: event.id!,
            type: 'event', 
            title: event.title, 
            icon: event.icon, 
            time: event.time,
            endTime: event.endTime
        });
       }
    });

    const newUnscheduled: ScheduledItem[] = [];
    const newScheduled: Record<string, ScheduledItem[]> = {};
    const newPlanner: PlannerColumns = { morning: [], afternoon: [], evening: [] };

    allItemsForDay.forEach(item => {
        if (!item.time) {
            if (!newUnscheduled.some(i => i.id === item.id)) {
                newUnscheduled.push(item);
            }
        } else {
            const hourKey = format(new Date(`${selectedDateStr}T${item.time}`), 'H');
            if (!newScheduled[hourKey]) newScheduled[hourKey] = [];
            if (!newScheduled[hourKey].some(i => i.id === item.id)) {
                newScheduled[hourKey].push(item);
            }
            
            const bucket = getPlannerBucket(item.time);
            if (bucket && !newPlanner[bucket].some(i => i.id === item.id)) {
                newPlanner[bucket].push(item);
            }
        }
    });

    setUnscheduled(newUnscheduled);
    setScheduledItems(newScheduled);
    setPlannerColumns(newPlanner);
  }, [selectedDate, habits, tasks, events]);

  useEffect(() => {
    if (isClient) {
      loadItemsForDate();
    }
  }, [loadItemsForDate, isClient]);

  // Auto-reload when data changes
  useEffect(() => {
    if (isClient) {
      loadItemsForDate();
    }
  }, [habits, tasks, events, selectedDate, isClient]);


  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
        return;
    }

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    let item: ScheduledItem | undefined;
    
    // Find the dragged item
    if (sourceId === 'unscheduled') {
        item = unscheduled.find(i => i.id === draggableId);
    } else if (sourceId.startsWith('timeline-')) {
        const hour = sourceId.split('-')[1];
        item = scheduledItems[hour]?.find(i => i.id === draggableId);
    } else { // planner
        item = plannerColumns[sourceId as keyof PlannerColumns]?.find(i => i.id === draggableId);
    }

    if (!item) return;

    // Handle dropping into 'unscheduled'
    if (destId === 'unscheduled') {
        updateScheduledItemTime(item, selectedDate, null);
        return;
    }

    // Check if item already has a schedule (has time)
    const hasSchedule = !!(item.time && item.time !== '');
    setHasExistingSchedule(hasSchedule);
    
    // Prepare for modal
    setItemToSchedule(item);

    // Handle dropping into timeline
    if (destId.startsWith('timeline-')) {
        const hour = destId.split('-')[1];
        const startTime = format(new Date(selectedDate.setHours(parseInt(hour), 0)), 'HH:mm');
        setTimeValue(startTime);
        // Set default end time (1 hour after start) or use existing endTime
        const defaultEndHour = (parseInt(hour) + 1) % 24;
        const defaultEndTime = format(new Date(selectedDate.setHours(defaultEndHour, 0)), 'HH:mm');
        setEndTimeValue(item.endTime || defaultEndTime);
        setIsTimeModalOpen(true);
    } 
    // Handle dropping into planner
    else if (destId === 'morning' || destId === 'afternoon' || destId === 'evening') { 
        let defaultTime = '';
        if (destId === 'morning') defaultTime = '09:00';
        if (destId === 'afternoon') defaultTime = '14:00';
        if (destId === 'evening') defaultTime = '20:00';
        setTimeValue(item.time || defaultTime);
        // Set default end time (1 hour after start) or use existing endTime
        if (item.endTime) {
          setEndTimeValue(item.endTime);
        } else {
          const [hours, minutes] = (item.time || defaultTime).split(':').map(Number);
          const endHour = (hours + 1) % 24;
          setEndTimeValue(format(new Date(new Date().setHours(endHour, minutes)), 'HH:mm'));
        }
        setIsTimeModalOpen(true);
    }
  };


  const handleSetTime = async (action: 'move' | 'duplicate') => {
    if (!itemToSchedule) return;
    
    if (action === 'duplicate') {
      // Create a duplicate with new time
      await duplicateScheduledItem(itemToSchedule, selectedDate, timeValue, endTimeValue);
    } else {
      // Move the original item
      await updateScheduledItemTime(itemToSchedule, selectedDate, timeValue, endTimeValue);
    }
    
    setIsTimeModalOpen(false);
    setItemToSchedule(null);
    setTimeValue('');
    setEndTimeValue('');
  };

  const handleScheduleItem = async (item: ScheduledItem, startTime: string, endTime: string) => {
    await updateScheduledItemTime(item, selectedDate, startTime, endTime);
  };

  const openScheduleModal = (hourKey?: string, defaultTime?: string) => {
    if (hourKey) {
      // hourKey is just the hour number (e.g., "5" for 5AM)
      const hourNum = parseInt(hourKey, 10);
      const timeStr = format(new Date(new Date().setHours(hourNum, 0)), 'HH:mm');
      setScheduleModalDefaultTime(timeStr);
    } else {
      setScheduleModalDefaultTime(defaultTime || '');
    }
    setIsScheduleItemModalOpen(true);
  };
  
  const handleUnscheduleItem = (itemToUnschedule: ScheduledItem) => {
    updateScheduledItemTime(itemToUnschedule, selectedDate, null, null);
  };
  
  const handleAddBreak = () => {
    setEditingBreak(null);
    breakForm.reset({
        title: 'Break',
        icon: 'Coffee',
        date: selectedDate,
        startTime: '12:00',
        endTime: '13:00',
    });
    setIsBreakSheetOpen(true);
  };

  const handleEditBreak = (breakItem: Break) => {
    setEditingBreak(breakItem);
    breakForm.reset({
      ...breakItem,
      date: new Date(breakItem.date)
    });
    setIsBreakSheetOpen(true);
  };


  const DraggableItem = ({ item, index, sourceId }: { item: ScheduledItem; index: number; sourceId: string; }) => (
    <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
            <div 
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border bg-card/80 backdrop-blur-sm cursor-grab z-20 relative",
                    snapshot.isDragging && "shadow-lg scale-105"
                )}
            >
                <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                <Icon name={item.icon} className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                    <span className="font-medium">{item.title}</span>
                    {item.time && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {item.time}
                            {item.endTime && (
                                <>
                                    <span>-</span>
                                    {item.endTime}
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {sourceId !== 'unscheduled' && (
                    <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleUnscheduleItem(item)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                    )}
                    <Badge variant={
                        item.type === 'habit' ? 'default' :
                        item.type === 'task' ? 'secondary' : 'success'
                    }>{item.type}</Badge>
                </div>
            </div>
        )}
    </Draggable>
  );

  const DroppableSlot = ({ droppableId, children, className }: { droppableId: string, children: React.ReactNode, className?: string }) => (
    <Droppable droppableId={droppableId} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(className, snapshot.isDraggingOver && 'bg-primary/10 transition-colors')}
            >
                {children}
                {provided.placeholder}
            </div>
        )}
    </Droppable>
  );

  const BreakBlock = ({ breakItem }: { breakItem: Break }) => {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Icon name={breakItem.icon} className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-orange-900">{breakItem.title}</p>
                <p className="text-xs text-orange-600 font-medium">
                  {breakItem.startTime} - {breakItem.endTime}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-orange-100" 
                onClick={() => handleEditBreak(breakItem)}
              >
                <Edit className="h-3 w-3 text-orange-600" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-red-100 text-red-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Break?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the break: "{breakItem.title}"?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteBreak(breakItem.id!)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {/* Duration indicator */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-orange-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs text-orange-600 font-medium">
              {Math.round((parse(breakItem.endTime, 'HH:mm', new Date()).getTime() - parse(breakItem.startTime, 'HH:mm', new Date()).getTime()) / (1000 * 60))}min
            </span>
          </div>
        </CardContent>
      </Card>
    );
};


  const TimelineView = () => {
    // Combine scheduled items with breaks for each hour
    // An item appears in an hour if it starts in that hour OR spans through it
    const getItemsForHour = (hourKey: string) => {
      const hourNum = parseInt(hourKey, 10);
      const itemsInHour: (ScheduledItem & { isSpanned?: boolean; breakItem?: Break })[] = [];
      
      // Check all scheduled items
      Object.entries(scheduledItems).forEach(([startHourKey, items]) => {
        items.forEach(item => {
          const startHourNum = parseInt(startHourKey, 10);
          
          if (startHourNum === hourNum) {
            // Item starts in this hour
            itemsInHour.push(item);
          } else if (item.endTime) {
            // Item spans multiple hours - check if it spans into this hour
            const [endHours, endMinutes] = item.endTime.split(':').map(Number);
            const endHourNum = endHours;
            
            if (startHourNum < hourNum && hourNum <= endHourNum) {
              // Item spans through this hour
              itemsInHour.push({ ...item, isSpanned: true });
            }
          }
        });
      });
      
      // Add breaks
      const breaksInHour = dailyBreaks.filter(breakItem => {
        const breakStartHour = format(parse(breakItem.startTime, 'HH:mm', new Date()), 'H');
        const breakStartHourNum = parseInt(breakStartHour, 10);
        const [endHours] = breakItem.endTime.split(':').map(Number);
        
        return breakStartHourNum === hourNum || (breakStartHourNum < hourNum && hourNum <= endHours);
      });
      
      breaksInHour.forEach(breakItem => {
        const breakStartHour = format(parse(breakItem.startTime, 'HH:mm', new Date()), 'H');
        const breakStartHourNum = parseInt(breakStartHour, 10);
        const isBreakSpanned = breakStartHourNum !== hourNum;
        
        itemsInHour.push({
          id: `break-${breakItem.id}-${hourNum}`,
          originalId: breakItem.id!,
          type: 'break' as const,
          title: breakItem.title,
          icon: breakItem.icon,
          time: breakItem.startTime,
          endTime: breakItem.endTime,
          isSpanned: isBreakSpanned,
          breakItem: breakItem
        });
      });
      
      return itemsInHour;
    };

    // Calculate the height/span for an item based on its duration
    const getItemStyle = (item: ScheduledItem & { breakItem?: Break }) => {
      if (!item.time) return {};
      
      let startTime = item.time;
      let endTime = item.endTime;
      
      if (item.breakItem) {
        startTime = item.breakItem.startTime;
        endTime = item.breakItem.endTime;
      }
      
      if (!endTime) return {};
      
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      const duration = endMinutes - startMinutes;
      
      // Calculate hours spanned (at least 1)
      const hoursSpanned = Math.max(1, Math.ceil(duration / 60));
      
      // Each hour slot is approximately 80px, calculate exact height
      const heightPx = hoursSpanned * 80;
      
      return {
        minHeight: `${heightPx}px`,
        height: 'auto'
      };
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className='space-y-1'>
            <CardTitle>
              {isToday(selectedDate)
                ? "Today's Schedule"
                : `Schedule for ${format(selectedDate, 'MMMM d, yyyy')}`}
            </CardTitle>
            <p className="text-muted-foreground text-sm">Drag items from 'Unscheduled' onto the timeline.</p>
          </div>
          <Button onClick={handleAddBreak} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Break
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hourlySlots.map((slot, index) => {
              const hourKey = format(slot, 'H');
              const itemsInSlot = getItemsForHour(hourKey);
              const droppableId = `timeline-${hourKey}`;
              return (
                <div 
                  key={index} 
                  className="flex items-start border-b last:border-b-0 relative"
                >
                  <div className="w-24 py-4 pr-4 text-right text-sm font-semibold text-muted-foreground min-h-[80px]">
                    {format(slot, 'h aa')}
                  </div>
                  <DroppableSlot droppableId={droppableId} className="flex-1 border-l p-4 min-h-[80px] space-y-2 relative group">
                    {itemsInSlot
                      .filter(item => {
                        // Only show the item in its starting hour, not in spanned hours
                        if (item.isSpanned) return false;
                        
                        // For breaks, only show in starting hour
                        if (item.breakItem) {
                          const breakStartHour = format(parse(item.breakItem.startTime, 'HH:mm', new Date()), 'H');
                          return breakStartHour === hourKey;
                        }
                        
                        // For regular items, only show if they start in this hour
                        if (item.time) {
                          const itemStartHour = format(parse(item.time, 'HH:mm', new Date()), 'H');
                          return itemStartHour === hourKey;
                        }
                        
                        return true;
                      })
                      .map((item, itemIndex) => {
                        const itemStyle = getItemStyle(item);
                        
                        if (item.type === 'break' || item.breakItem) {
                          return (
                            <div key={item.id} style={itemStyle} className="flex-1">
                              <BreakBlock breakItem={item.breakItem!} />
                            </div>
                          );
                        }
                        
                        return (
                          <div key={item.id} style={itemStyle} className="flex-1">
                            <DraggableItem item={item} index={itemIndex} sourceId={droppableId} />
                          </div>
                        );
                      })}
                    {/* Add Item Button - appears on hover or when empty */}
                    {unscheduled.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                          itemsInSlot.filter(item => !item.isSpanned && (!item.breakItem || format(parse(item.breakItem?.startTime || '', 'HH:mm', new Date()), 'H') === hourKey)).length === 0 && "opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          openScheduleModal(hourKey);
                        }}
                        title="Add item to this time slot"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </DroppableSlot>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const PlannerView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(plannerColumns) as Array<keyof PlannerColumns>).map(columnKey => (
            <Card key={columnKey}>
                <CardHeader>
                    <CardTitle className="capitalize">{columnKey}</CardTitle>
                </CardHeader>
                <DroppableSlot droppableId={columnKey} className="p-6 pt-0 min-h-[15rem] space-y-3 relative group">
                    {plannerColumns[columnKey].map((item, itemIndex) => (
                         <DraggableItem key={item.id} item={item} index={itemIndex} sourceId={columnKey} />
                    ))}
                    {/* Add Item Button for planner view */}
                    {unscheduled.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full opacity-0 group-hover:opacity-100 transition-opacity mt-2",
                          plannerColumns[columnKey].length === 0 && "opacity-100"
                        )}
                        onClick={() => {
                          let defaultTime = '';
                          if (columnKey === 'morning') defaultTime = '09:00';
                          if (columnKey === 'afternoon') defaultTime = '14:00';
                          if (columnKey === 'evening') defaultTime = '20:00';
                          openScheduleModal(undefined, defaultTime);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    )}
                </DroppableSlot>
            </Card>
        ))}
    </div>
  );

  const ModernTimelineView = () => {
    const timelineData = useMemo(() => {
      const periods = [
        { 
          key: 'morning', 
          label: 'Morning', 
          time: '05:00 - 12:00', 
          icon: 'Sunrise',
          gradient: 'from-amber-500/10 via-orange-500/5 to-yellow-500/10',
          borderColor: 'border-amber-200/50',
          dotColor: 'bg-gradient-to-br from-amber-400 to-orange-500',
          textColor: 'text-amber-700 dark:text-amber-300'
        },
        { 
          key: 'afternoon', 
          label: 'Afternoon', 
          time: '12:00 - 18:00', 
          icon: 'Sun',
          gradient: 'from-blue-500/10 via-sky-500/5 to-cyan-500/10',
          borderColor: 'border-blue-200/50',
          dotColor: 'bg-gradient-to-br from-blue-400 to-cyan-500',
          textColor: 'text-blue-700 dark:text-blue-300'
        },
        { 
          key: 'evening', 
          label: 'Evening', 
          time: '18:00 - 05:00', 
          icon: 'Moon',
          gradient: 'from-purple-500/10 via-violet-500/5 to-indigo-500/10',
          borderColor: 'border-purple-200/50',
          dotColor: 'bg-gradient-to-br from-purple-400 to-indigo-500',
          textColor: 'text-purple-700 dark:text-purple-300'
        }
      ];

      return periods.map(period => ({
        ...period,
        items: (plannerColumns[period.key as keyof PlannerColumns] || [])
          .sort((a, b) => {
            // Sort by time if both have time, otherwise keep original order
            if (a.time && b.time) {
              return a.time.localeCompare(b.time);
            }
            if (a.time && !b.time) return -1;
            if (!a.time && b.time) return 1;
            return 0;
          })
      }));
    }, [plannerColumns]);

    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {timelineData.map((period, periodIndex) => (
          <Card key={period.key} className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background via-background/95 to-background/90">
            <CardHeader className={`bg-gradient-to-r ${period.gradient} ${period.borderColor} border-b-2 p-3 sm:p-4 md:p-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm`}>
                    <Icon name={period.icon} className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${period.textColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className={`text-base sm:text-lg md:text-xl font-bold ${period.textColor} tracking-tight truncate`}>
                      {period.label}
                    </CardTitle>
                    <p className={`text-xs sm:text-sm font-medium ${period.textColor}/80`}>
                      {period.time}
                    </p>
                    {period.items.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        <span className={`text-xs font-semibold ${period.textColor}/70`}>
                          Scheduled:
                        </span>
                        <span className={`text-xs font-mono ${period.textColor}/90 truncate`}>
                          {period.items
                            .filter(item => item.time)
                            .map(item => item.time)
                            .sort()
                            .slice(0, 2)
                            .join(', ')}
                          {period.items.filter(item => item.time).length > 2 && '...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-white/90 dark:bg-black/20 text-foreground font-semibold px-2 py-1 sm:px-3 sm:py-1.5 shadow-sm text-xs sm:text-sm self-start sm:self-auto"
                >
                  {period.items.length} {period.items.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative group">
              <DroppableSlot 
                droppableId={period.key} 
                className="min-h-[180px] sm:min-h-[200px] md:min-h-[240px] p-3 sm:p-4 md:p-6 lg:p-8 space-y-3 sm:space-y-4 md:space-y-6 relative"
              >
                {period.items.length > 0 ? (
                  <div className="relative">
                    {/* Main timeline line - responsive positioning */}
                    <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
                    
                    {period.items.map((item, itemIndex) => (
                      <div key={item.id} className="relative pl-12 sm:pl-16">
                        {/* Timeline dot with glow effect - responsive size */}
                        <div className={`absolute left-4 sm:left-6 top-4 sm:top-6 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${period.dotColor} shadow-lg border-2 border-background ring-2 ring-primary/20`} />
                        
                        {/* Connecting line to next item - responsive positioning */}
                        {itemIndex < period.items.length - 1 && (
                          <div className="absolute left-[15px] sm:left-[23px] top-6 sm:top-10 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-primary/40 to-primary/10" />
                        )}
                        
                        {/* Timeline item card - ultra responsive layout */}
                        <div className="group relative">
                          <div className="bg-card/90 backdrop-blur-sm border border-border/50 hover:bg-card hover:border-border/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 rounded-2xl overflow-hidden">
                            {/* Mobile-first layout */}
                            <div className="block sm:hidden">
                              <div className="p-4">
                                {/* Top row: Time + Icon + Actions */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    {item.time && (
                                      <div className="bg-primary/15 rounded-lg px-3 py-2 border border-primary/30">
                                        <div className="text-lg font-bold text-primary font-mono">
                                          {item.time}
                                        </div>
                                        <div className="text-xs text-primary/70 font-medium uppercase">
                                          {parseInt(item.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                        </div>
                                      </div>
                                    )}
                                    <div className="p-2 rounded-lg bg-primary/10">
                                      <Icon name={item.icon} className="h-5 w-5 text-primary" />
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleUnscheduleItem(item)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {/* Content */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-foreground truncate flex-1">
                                      {item.title}
                                    </h3>
                                    <Badge 
                                      variant={
                                        item.type === 'habit' ? 'default' :
                                        item.type === 'task' ? 'secondary' : 'success'
                                      }
                                      className="text-xs px-2 py-1"
                                    >
                                      {item.type}
                                    </Badge>
                                  </div>
                                  
                                  {!item.time && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span className="font-medium">No specific time</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Tablet layout */}
                            <div className="hidden sm:block lg:hidden">
                              <div className="p-5">
                                <div className="flex items-start gap-4">
                                  {/* Time + Icon column */}
                                  <div className="flex flex-col gap-3">
                                    {item.time && (
                                      <div className="bg-primary/15 rounded-xl px-4 py-3 border border-primary/30">
                                        <div className="text-xl font-bold text-primary font-mono">
                                          {item.time}
                                        </div>
                                        <div className="text-xs text-primary/70 font-medium uppercase">
                                          {parseInt(item.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                        </div>
                                      </div>
                                    )}
                                    <div className="p-3 rounded-xl bg-primary/10">
                                      <Icon name={item.icon} className="h-6 w-6 text-primary" />
                                    </div>
                                  </div>
                                  
                                  {/* Content column */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-lg font-bold text-foreground truncate">
                                        {item.title}
                                      </h3>
                                      <Badge 
                                        variant={
                                          item.type === 'habit' ? 'default' :
                                          item.type === 'task' ? 'secondary' : 'success'
                                        }
                                        className="text-sm px-3 py-1"
                                      >
                                        {item.type}
                                      </Badge>
                                    </div>
                                    
                                    {!item.time && (
                                      <div className="flex items-center gap-2 text-base text-muted-foreground">
                                        <Clock className="h-5 w-5" />
                                        <span className="font-medium">No specific time</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex-shrink-0">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleUnscheduleItem(item)}
                                    >
                                      <X className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Desktop layout */}
                            <div className="hidden lg:block">
                              <div className="p-6">
                                <div className="flex items-center gap-6">
                                  {/* Time display */}
                                  {item.time && (
                                    <div className="flex-shrink-0">
                                      <div className="bg-primary/15 rounded-2xl px-5 py-4 border border-primary/30">
                                        <div className="text-2xl font-bold text-primary font-mono">
                                          {item.time}
                                        </div>
                                        <div className="text-sm text-primary/70 font-medium uppercase tracking-wide">
                                          {parseInt(item.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Icon */}
                                  <div className="flex-shrink-0 p-4 rounded-2xl bg-primary/10">
                                    <Icon name={item.icon} className="h-7 w-7 text-primary" />
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 mb-3">
                                      <h3 className="text-xl font-bold text-foreground truncate">
                                        {item.title}
                                      </h3>
                                      <Badge 
                                        variant={
                                          item.type === 'habit' ? 'default' :
                                          item.type === 'task' ? 'secondary' : 'success'
                                        }
                                        className="text-base px-4 py-2"
                                      >
                                        {item.type}
                                      </Badge>
                                    </div>
                                    
                                    {!item.time && (
                                      <div className="flex items-center gap-3 text-lg text-muted-foreground">
                                        <Clock className="h-6 w-6" />
                                        <span className="font-medium">No specific time</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex-shrink-0">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-12 w-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleUnscheduleItem(item)}
                                    >
                                      <X className="h-6 w-6" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                    <div className="relative mb-4 sm:mb-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center shadow-inner">
                        <Icon name={period.icon} className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/60" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">0</span>
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                      No {period.label.toLowerCase()} items
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-xs sm:max-w-sm leading-relaxed">
                      Drag items from "Unscheduled" to schedule them for this time period
                    </p>
                    {unscheduled.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          let defaultTime = '';
                          if (period.key === 'morning') defaultTime = '09:00';
                          if (period.key === 'afternoon') defaultTime = '14:00';
                          if (period.key === 'evening') defaultTime = '20:00';
                          openScheduleModal(undefined, defaultTime);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    )}
                  </div>
                )}
                {/* Add Item Button for modern timeline - appears on hover */}
                {unscheduled.length > 0 && period.items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      let defaultTime = '';
                      if (period.key === 'morning') defaultTime = '09:00';
                      if (period.key === 'afternoon') defaultTime = '14:00';
                      if (period.key === 'evening') defaultTime = '20:00';
                      openScheduleModal(undefined, defaultTime);
                    }}
                    title="Add item to this period"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </DroppableSlot>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!isClient) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold">Daily Schedule</h1>
                    <p className="text-muted-foreground mt-1">Organize your day by assigning items to time slots.</p>
                </div>
                <div className="flex items-center gap-4">
                    <ToggleGroup type="single" value={view} onValueChange={(value: 'timeline' | 'planner' | 'timeline-view') => value && setView(value)}>
                        <ToggleGroupItem value="timeline" aria-label="Timeline view">
                            <List className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="planner" aria-label="Planner view">
                            <LayoutGrid className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="timeline-view" aria-label="Modern Timeline view">
                            <Clock className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full sm:w-[280px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <Card className="h-fit">
                    <CardHeader>
                    <CardTitle>Unscheduled ({unscheduled.length})</CardTitle>
                    </CardHeader>
                    <DroppableSlot droppableId="unscheduled" className="p-6 pt-0 min-h-[10rem] space-y-3">
                        {unscheduled.map((item, index) => (
                            <DraggableItem key={item.id} item={item} index={index} sourceId="unscheduled" />
                        ))}
                        {unscheduled.length === 0 && (
                            <div className="text-center text-muted-foreground py-16">
                                <p>Nothing left to schedule for this day.</p>
                            </div>
                        )}
                    </DroppableSlot>
                </Card>

                <div className="space-y-2">
                    {view === 'timeline' && <TimelineView />}
                    {view === 'planner' && <PlannerView />}
                    {view === 'timeline-view' && <ModernTimelineView />}
                </div>
            </div>
        </div>
      </DragDropContext>
      
       <TimeModal
         isOpen={isTimeModalOpen}
         onClose={() => setIsTimeModalOpen(false)}
         item={itemToSchedule}
         timeValue={timeValue}
         onTimeChange={setTimeValue}
         endTimeValue={endTimeValue}
         onEndTimeChange={setEndTimeValue}
         onConfirm={handleSetTime}
         hasExistingSchedule={hasExistingSchedule}
       />

      <BreakSheet 
        form={breakForm}
        isSheetOpen={isBreakSheetOpen}
        setIsSheetOpen={setIsBreakSheetOpen}
        editingBreak={editingBreak}
        selectedDate={selectedDate}
      />

      <ScheduleItemModal
        isOpen={isScheduleItemModalOpen}
        onClose={() => setIsScheduleItemModalOpen(false)}
        unscheduledItems={unscheduled}
        defaultTime={scheduleModalDefaultTime}
        onConfirm={handleScheduleItem}
      />
    </AppLayout>
  );
}

    
