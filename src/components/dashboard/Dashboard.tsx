

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { addDays, format, startOfWeek, isSameDay, getDay, isBefore, startOfDay, isAfter } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Day, AppEvent, Task, Habit } from '@/lib/types';
import * as Lucide from 'lucide-react';
import { PlusCircle, ClipboardList, Calendar, Target, Filter, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CustomCheckbox } from './CustomCheckbox';
import { useAppData } from '@/context/AppDataContext';
import { WeeklyProgressChart } from './WeeklyProgressChart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const dayMapping: Day[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type CombinedItem = {
  id: string;
  type: 'habit' | 'task' | 'event';
  title: string;
  icon: string;
};

// A helper to get a Lucide icon by name
export const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
  const LucideIcon = (Lucide as any)[name];
  if (!LucideIcon) {
    return <Lucide.HelpCircle {...props} />;
  }
  return <LucideIcon {...props} />;
};


type FilterType = 'habits' | 'tasks' | 'events';

export function Dashboard() {
  const { habits, tasks, events, completions, toggleCompletion } = useAppData();
  const [currentDate] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['habits', 'tasks', 'events']);
  const isMobile = useIsMobile();
  
  const allTasks = useMemo(() => tasks, [tasks]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate]);

  const getDailyItems = useMemo(() => {
    return (date: Date): CombinedItem[] => {
        const dayOfWeek = dayMapping[getDay(date)];
        let items: CombinedItem[] = [];

        // Add habits if filter is active
        if (activeFilters.includes('habits')) {
            const habitsToday = habits
                .filter(h => h.schedule.includes(dayOfWeek))
                .map(h => ({ id: h.id!, type: 'habit' as const, title: h.name, icon: h.icon }));
            items.push(...habitsToday);
        }

        // Add tasks if filter is active
        if (activeFilters.includes('tasks')) {
            const tasksToday = allTasks
                .filter(t => t.dueDate && isSameDay(t.dueDate, date))
                .map(t => ({ id: t.id!, type: 'task' as const, title: t.title, icon: 'ClipboardCheck' }));
            items.push(...tasksToday);
        }
        
        // Add events if filter is active
        if (activeFilters.includes('events')) {
            const eventsToday = events
                .filter(e => isSameDay(e.date, date))
                .map(e => ({ id: e.id!, type: 'event' as const, title: e.title, icon: e.icon || 'CalendarPlus' }));
            items.push(...eventsToday);
        }

        return items.sort((a,b) => a.title.localeCompare(b.title));
    }
  }, [habits, allTasks, events, activeFilters]);

  const handleCheck = (itemId: string, date: Date) => {
    const key = `${itemId}-${format(date, 'yyyy-MM-dd')}`;
    const currentStatus = completions[key] || false;
    toggleCompletion(itemId, date);
  };

  // Filter management functions
  const toggleFilter = (filterType: FilterType) => {
    setActiveFilters(prev => {
      if (prev.includes(filterType)) {
        // Don't allow removing all filters
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== filterType);
      } else {
        return [...prev, filterType];
      }
    });
  };

  const toggleAllFilters = () => {
    const allFilters: FilterType[] = ['habits', 'tasks', 'events'];
    if (activeFilters.length === allFilters.length) {
      // If all are active, keep at least one (habits)
      setActiveFilters(['habits']);
    } else {
      // Activate all
      setActiveFilters(allFilters);
    }
  };

  // Calculate filter statistics
  const filterStats = useMemo(() => {
    const weekItems = weekDays.flatMap(day => {
      const dayOfWeek = dayMapping[getDay(day)];
      const habitsToday = habits.filter(h => h.schedule.includes(dayOfWeek));
      const tasksToday = allTasks.filter(t => t.dueDate && isSameDay(t.dueDate, day));
      const eventsToday = events.filter(e => isSameDay(e.date, day));
      
      return [
        ...habitsToday.map(h => ({ type: 'habits' as const, id: h.id! })),
        ...tasksToday.map(t => ({ type: 'tasks' as const, id: t.id! })),
        ...eventsToday.map(e => ({ type: 'events' as const, id: e.id! }))
      ];
    });

    return {
      habits: weekItems.filter(item => item.type === 'habits').length,
      tasks: weekItems.filter(item => item.type === 'tasks').length,
      events: weekItems.filter(item => item.type === 'events').length,
      total: weekItems.length
    };
  }, [weekDays, habits, allTasks, events]);

  const todayStats = useMemo(() => {
    const todayItems = getDailyItems(currentDate);
    const todayKey = format(currentDate, 'yyyy-MM-dd');
    
    const remainingItems = todayItems.filter(item => {
        const completionKey = `${item.id}-${todayKey}`;
        return !completions[completionKey];
    });

    return {
        habits: remainingItems.filter(i => i.type === 'habit').length,
        tasks: remainingItems.filter(i => i.type === 'task').length,
        events: remainingItems.filter(i => i.type === 'event').length,
    }
  }, [currentDate, getDailyItems, completions]);

  // Responsive Filter component
  const FilterControls = () => (
    <div className="space-y-3">
      {/* Mobile Layout */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter Schedule</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAllFilters}
            className="ml-auto h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {activeFilters.length === 3 ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Filter
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                All
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {/* Mobile Habits Filter */}
          <button
            onClick={() => toggleFilter('habits')}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-all duration-200 min-h-[60px]",
              activeFilters.includes('habits')
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Target className="h-4 w-4" />
            <span>Habits</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "h-3 px-1 text-[9px] font-medium",
                activeFilters.includes('habits')
                  ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                  : "bg-background text-muted-foreground"
              )}
            >
              {filterStats.habits}
            </Badge>
          </button>

          {/* Mobile Tasks Filter */}
          <button
            onClick={() => toggleFilter('tasks')}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-all duration-200 min-h-[60px]",
              activeFilters.includes('tasks')
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Tasks</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "h-3 px-1 text-[9px] font-medium",
                activeFilters.includes('tasks')
                  ? "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                  : "bg-background text-muted-foreground"
              )}
            >
              {filterStats.tasks}
            </Badge>
          </button>

          {/* Mobile Events Filter */}
          <button
            onClick={() => toggleFilter('events')}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-all duration-200 min-h-[60px]",
              activeFilters.includes('events')
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Events</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "h-3 px-1 text-[9px] font-medium",
                activeFilters.includes('events')
                  ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                  : "bg-background text-muted-foreground"
              )}
            >
              {filterStats.events}
            </Badge>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">View:</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Desktop Habits Filter */}
          <button
            onClick={() => toggleFilter('habits')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
              activeFilters.includes('habits')
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Target className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Habits</span>
            <span className="md:hidden">H</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "h-4 px-1.5 text-[10px] font-medium",
                activeFilters.includes('habits')
                  ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {filterStats.habits}
            </Badge>
          </button>

          {/* Desktop Tasks Filter */}
          <button
            onClick={() => toggleFilter('tasks')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
              activeFilters.includes('tasks')
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Tasks</span>
            <span className="md:hidden">T</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "h-4 px-1.5 text-[10px] font-medium",
                activeFilters.includes('tasks')
                  ? "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {filterStats.tasks}
            </Badge>
          </button>

          {/* Desktop Events Filter */}
          <button
            onClick={() => toggleFilter('events')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
              activeFilters.includes('events')
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Events</span>
            <span className="md:hidden">E</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "h-4 px-1.5 text-[10px] font-medium",
                activeFilters.includes('events')
                  ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {filterStats.events}
            </Badge>
          </button>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Desktop Show All Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAllFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {activeFilters.length === 3 ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                <span className="hidden lg:inline">Filter</span>
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                <span className="hidden lg:inline">All</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );


  const ScheduleComponent = () => (
     <Card className="overflow-hidden">
      <ScrollArea>
        <div className="grid grid-cols-7 min-w-[64rem] divide-x divide-border">
          {weekDays.map(day => {
             const items = getDailyItems(day);
             const isToday = isSameDay(day, new Date());
             const isPast = isBefore(day, startOfDay(new Date()));
             const isFuture = isAfter(day, startOfDay(new Date()));

             return (
                <div key={day.toString()} className={`p-4 ${isToday ? 'bg-secondary' : ''} ${isPast ? 'opacity-70' : ''}`}>
                    <div className="text-center mb-4">
                        <p className="font-semibold">{format(day, 'E')}</p>
                        <p className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                        </p>
                    </div>
                    <div className="space-y-3">
                        {items.map(item => {
                            const completionKey = `${item.id}-${format(day, 'yyyy-MM-dd')}`;
                            let isCompleted = completions[completionKey] || false;
                            
                            // For tasks, also check if they have a completionDate
                            if (item.type === 'task') {
                                const task = allTasks.find(t => t.id === item.id);
                                if (task && task.completionDate && isSameDay(task.completionDate, day)) {
                                    isCompleted = true;
                                }
                            }
                            
                            let variant: 'primary' | 'secondary' | 'success' = 'primary';
                            if (item.type === 'task') variant = 'secondary';
                            if (item.type === 'event') variant = 'success';

                            return (
                                <div key={item.id} className="flex items-center space-x-3 rounded-lg bg-background p-3 shadow-sm transition-all hover:shadow-md border">
                                    <CustomCheckbox
                                        id={completionKey}
                                        checked={isCompleted}
                                        onCheckedChange={() => handleCheck(item.id, day)}
                                        variant={variant}
                                        disabled={isFuture}
                                    />
                                    <label htmlFor={completionKey} className={`flex-1 font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                        {item.title}
                                    </label>
                                    <Icon name={item.icon} className="h-5 w-5 text-muted-foreground" />
                                </div>
                            )
                        })}
                        {items.length === 0 && (
                            <div className="text-center text-muted-foreground pt-8 pb-4">
                                {activeFilters.length === 3 ? (
                                    <p className="text-sm">Nothing scheduled.</p>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm">No {activeFilters.join(' or ')} for this day.</p>
                                        <p className="text-xs opacity-70">Try adjusting your filters above.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );

  const MobileSchedule = () => {
    const todayIndex = weekDays.findIndex(day => isSameDay(day, new Date()));
    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex !== -1 ? todayIndex : 0);

    const renderDayContent = (day: Date) => {
        const items = getDailyItems(day);
        const isFuture = isAfter(day, startOfDay(new Date()));

        return (
            <div className="space-y-3">
                {items.map(item => {
                    const completionKey = `${item.id}-${format(day, 'yyyy-MM-dd')}`;
                    let isCompleted = completions[completionKey] || false;
                    
                    // For tasks, also check if they have a completionDate
                    if (item.type === 'task') {
                        const task = allTasks.find(t => t.id === item.id);
                        if (task && task.completionDate && isSameDay(task.completionDate, day)) {
                            isCompleted = true;
                        }
                    }
                    
                    let variant: 'primary' | 'secondary' | 'success' = 'primary';
                    if (item.type === 'task') variant = 'secondary';
                    if (item.type === 'event') variant = 'success';

                    return (
                        <div key={item.id} className="flex items-center space-x-3 rounded-lg bg-background p-3 shadow-sm transition-all hover:shadow-md border">
                            <CustomCheckbox
                                id={completionKey}
                                checked={isCompleted}
                                onCheckedChange={() => handleCheck(item.id, day)}
                                variant={variant}
                                disabled={isFuture}
                            />
                            <label htmlFor={completionKey} className={`flex-1 font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {item.title}
                            </label>
                            <Icon name={item.icon} className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )
                })}
                {items.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        {activeFilters.length === 3 ? (
                            <p>Nothing scheduled for this day.</p>
                        ) : (
                            <div className="space-y-2">
                                <p>No {activeFilters.join(' or ')} for this day.</p>
                                <p className="text-sm opacity-70">Try adjusting your filters above.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    };

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-around mb-4 border-b pb-4">
            {weekDays.map((day, index) => (
              <button
                key={day.toString()}
                onClick={() => setSelectedDayIndex(index)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors w-12 ${selectedDayIndex === index ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
              >
                <p className="font-semibold text-sm">{format(day, 'E')}</p>
                <p className={`text-lg font-bold`}>
                  {format(day, 'd')}
                </p>
              </button>
            ))}
          </div>
          {renderDayContent(weekDays[selectedDayIndex])}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-8 w-full overflow-x-hidden">
      <div className="w-full">
        <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Today's Agenda</h1>
            <p className="text-muted-foreground">Your daily summary of tasks, events, and habits.</p>
        </div>
        {/* Mobile Layout - Single Column */}
        <div className="grid gap-3 sm:hidden w-full">
          <Card className="p-3 w-full">
            <div className="flex items-center justify-between w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
                  <ClipboardList className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">Tasks</h3>
                  <p className="text-xs text-muted-foreground truncate">for today</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-xl font-bold">{todayStats.tasks}</div>
                <p className="text-xs text-muted-foreground">items</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 w-full">
            <div className="flex items-center justify-between w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                  <Calendar className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">Events</h3>
                  <p className="text-xs text-muted-foreground truncate">scheduled</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-xl font-bold">{todayStats.events}</div>
                <p className="text-xs text-muted-foreground">items</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 w-full">
            <div className="flex items-center justify-between w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                  <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">Habits</h3>
                  <p className="text-xs text-muted-foreground truncate">to complete</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-xl font-bold">{todayStats.habits}</div>
                <p className="text-xs text-muted-foreground">items</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tablet Layout - 2 Columns */}
        <div className="hidden sm:grid lg:hidden gap-4 grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">Tasks for Today</CardTitle>
                <p className="text-xs text-muted-foreground">items on your to-do list</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <ClipboardList className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{todayStats.tasks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">Events Today</CardTitle>
                <p className="text-xs text-muted-foreground">events scheduled in calendar</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{todayStats.events}</div>
            </CardContent>
          </Card>
          
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">Habits Today</CardTitle>
                <p className="text-xs text-muted-foreground">habits to complete</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{todayStats.habits}</div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Layout - 3 Columns */}
        <div className="hidden lg:grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks for Today</CardTitle>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <ClipboardList className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{todayStats.tasks}</div>
                <p className="text-xs text-muted-foreground">items on your to-do list</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Today</CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{todayStats.events}</div>
                <p className="text-xs text-muted-foreground">events scheduled in calendar</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Habits Today</CardTitle>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{todayStats.habits}</div>
                <p className="text-xs text-muted-foreground">habits to complete</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">This Week's Schedule</h2>
            <p className="text-muted-foreground mt-1 text-sm truncate">
              {activeFilters.length === 3 
                ? `${filterStats.total} items scheduled this week`
                : `${activeFilters.length} category${activeFilters.length > 1 ? 'ies' : 'y'} selected`
              }
            </p>
          </div>
           <Link href="/goals" className="flex-shrink-0">
            <Button size={isMobile ? "icon" : "default"}>
                <PlusCircle className={isMobile ? "" : "mr-2 h-4 w-4"} />
                <span className="hidden md:inline">New Habit</span>
            </Button>
           </Link>
        </div>
        
        <div className="space-y-4 w-full">
          <FilterControls />
          { isMobile ? <MobileSchedule /> : <ScheduleComponent /> }
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Weekly Progress</h2>
        </div>
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
                <CardDescription>Percentage of items completed over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
                <WeeklyProgressChart 
                    getDailyItems={getDailyItems}
                    completions={completions}
                    allTasks={allTasks}
                />
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
