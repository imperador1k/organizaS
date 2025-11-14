'use client';

import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/dashboard/Dashboard';
import { Day, Task, AppEvent, Habit } from '@/lib/types';
import { useAppData } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { Target, ClipboardList, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const dayMapping: Day[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type CombinedEvent = {
  type: 'habit' | 'task' | 'event';
  title: string;
  icon: string;
  time?: string;
  completed?: boolean;
};


type FilterType = 'habits' | 'tasks' | 'events';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['habits', 'tasks', 'events']);
  const { habits, tasks, events: allEvents } = useAppData();
  
  const allTasks = useMemo(() => tasks, [tasks]);

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

  const eventsByDate = useMemo(() => {
    const eventsMap: Record<string, CombinedEvent[]> = {};

    // Process habits if filter is active
    if (activeFilters.includes('habits')) {
      habits.forEach(habit => {
        for (let i = 0; i < 365; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i - 180);
          const dayOfWeek = dayMapping[d.getDay()];
          if (habit.schedule.includes(dayOfWeek)) {
            const dateStr = format(d, 'yyyy-MM-dd');
            if (!eventsMap[dateStr]) {
              eventsMap[dateStr] = [];
            }
            eventsMap[dateStr].push({
              type: 'habit',
              title: habit.name,
              icon: habit.icon,
              time: habit.timeOfDay === 'any' ? undefined : habit.timeOfDay,
            });
          }
        }
      });
    }

    // Process tasks if filter is active (including completed)
    if (activeFilters.includes('tasks')) {
      allTasks.forEach(task => {
          const taskDate = task.dueDate || task.completionDate;
          if (taskDate) {
              const dateStr = format(new Date(taskDate), 'yyyy-MM-dd');
              if (!eventsMap[dateStr]) {
                  eventsMap[dateStr] = [];
              }
              eventsMap[dateStr].push({
                  type: 'task',
                  title: task.title,
                  icon: 'ClipboardCheck',
                  completed: !!task.completionDate,
              });
          }
      });
    }
    
    // Process custom events if filter is active
    if (activeFilters.includes('events')) {
      allEvents.forEach(event => {
          const dateStr = format(event.date, 'yyyy-MM-dd');
          if (!eventsMap[dateStr]) {
              eventsMap[dateStr] = [];
          }
          eventsMap[dateStr].push({
              type: 'event',
              title: event.title,
              icon: event.icon,
              time: event.time,
          });
      });
    }

    return eventsMap;
  }, [allTasks, allEvents, habits, activeFilters]);

  const { taskDays, eventDays } = useMemo(() => {
    const taskDaysSet = new Set<number>();
    const eventDaysSet = new Set<number>();
    
    allTasks.forEach(task => {
        const taskDueDate = task.dueDate;
         if (taskDueDate && !task.completionDate) {
            taskDaysSet.add(new Date(taskDueDate).setHours(0,0,0,0));
        }
    });
    
    allEvents.forEach(event => {
        eventDaysSet.add(new Date(event.date).setHours(0,0,0,0));
    });

    // Ensure event days take precedence by removing them from task days
    eventDaysSet.forEach(day => {
        if(taskDaysSet.has(day)) {
            taskDaysSet.delete(day);
        }
    });

    return {
        taskDays: Array.from(taskDaysSet).map(d => new Date(d)),
        eventDays: Array.from(eventDaysSet).map(d => new Date(d))
    };
  }, [allTasks, allEvents]);


  const selectedDayEvents = useMemo(() => {
    const events = date ? eventsByDate[format(date, 'yyyy-MM-dd')] || [] : [];
    return events.sort((a, b) => a.title.localeCompare(b.title));
  }, [date, eventsByDate]);

  // Filter statistics
  const filterStats = useMemo(() => {
    const selectedEvents = selectedDayEvents;
    return {
      habits: selectedEvents.filter(e => e.type === 'habit').length,
      tasks: selectedEvents.filter(e => e.type === 'task').length,
      events: selectedEvents.filter(e => e.type === 'event').length,
      total: selectedEvents.length
    };
  }, [selectedDayEvents]);

  // Responsive Filter component
  const FilterControls = () => (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter items:</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={() => toggleFilter('habits')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[50px] w-full",
              activeFilters.includes('habits')
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Target className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Habits</span>
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

          <button
            onClick={() => toggleFilter('tasks')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[50px] w-full",
              activeFilters.includes('tasks')
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Tasks</span>
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

          <button
            onClick={() => toggleFilter('events')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[50px] w-full",
              activeFilters.includes('events')
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Events</span>
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

      {/* Desktop Layout - Compact */}
      <div className="hidden sm:flex items-center justify-center gap-1 mb-3">
        <button
          onClick={() => toggleFilter('habits')}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200",
            activeFilters.includes('habits')
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Target className="h-3 w-3" />
          <span>Habits</span>
          <Badge 
            variant="secondary" 
            className={cn(
              "h-3 px-1 text-[9px] font-medium ml-1",
              activeFilters.includes('habits')
                ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                : "bg-muted text-muted-foreground"
            )}
          >
            {filterStats.habits}
          </Badge>
        </button>

        <button
          onClick={() => toggleFilter('tasks')}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200",
            activeFilters.includes('tasks')
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <ClipboardList className="h-3 w-3" />
          <span>Tasks</span>
          <Badge 
            variant="secondary" 
            className={cn(
              "h-3 px-1 text-[9px] font-medium ml-1",
              activeFilters.includes('tasks')
                ? "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                : "bg-muted text-muted-foreground"
            )}
          >
            {filterStats.tasks}
          </Badge>
        </button>

        <button
          onClick={() => toggleFilter('events')}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200",
            activeFilters.includes('events')
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <CalendarIcon className="h-3 w-3" />
          <span>Events</span>
          <Badge 
            variant="secondary" 
            className={cn(
              "h-3 px-1 text-[9px] font-medium ml-1",
              activeFilters.includes('events')
                ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                : "bg-muted text-muted-foreground"
            )}
          >
            {filterStats.events}
          </Badge>
        </button>
      </div>
    </div>
  );
  
  const GeneralItem = ({ event }: { event: CombinedEvent }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-muted hover:bg-accent transition-all duration-200">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon name={event.icon} className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
            <p className="font-semibold">
                {event.completed ? <del className="text-muted-foreground">{event.title}</del> : event.title}
            </p>
            {event.time && <Badge variant="outline" className="mt-1 capitalize">{event.time}</Badge>}
        </div>
        <Badge variant={
          event.type === 'habit' ? 'default' : 
          event.type === 'task' ? 'secondary' : 'success'
        } className="capitalize">
          {event.type}
        </Badge>
    </div>
  )

  return (
    <AppLayout>
      <div className="w-full overflow-x-hidden">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          <Card className="shadow-lg p-4 w-full">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0 w-full"
                classNames={{
                root: 'w-full',
                months: 'flex-1 flex flex-col',
                month: 'h-full flex flex-col',
                table: 'h-full w-full border-collapse flex flex-col',
                head_row: 'flex w-full',
                head_cell: 'text-muted-foreground w-full font-normal text-sm py-2 text-center flex-1',
                row: 'flex w-full',
                cell: 'w-full text-center text-sm p-0 relative flex-1 flex items-center justify-center',
                day: 'w-full h-12 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground flex items-center justify-center',
                day_today: 'bg-secondary font-bold text-secondary-foreground border-2 border-secondary',
                day_disabled: 'text-muted-foreground/50',
                }}
                modifiers={{
                    tasks: taskDays,
                    events: eventDays
                }}
                modifiersClassNames={{ 
                    tasks: 'relative before:content-[""] before:absolute before:bottom-1.5 before:left-1/2 before:-translate-x-1/2 before:h-2 before:w-2 before:rounded-full before:bg-primary',
                    events: 'relative before:content-[""] before:absolute before:bottom-1.5 before:left-1/2 before:-translate-x-1/2 before:h-2 before:w-2 before:rounded-full before:bg-success'
                }}
            />
          </Card>
          
          <Card className="shadow-lg w-full">
              <CardHeader className="pb-3">
                  <CardTitle className="text-lg truncate">
                      {date ? format(date, 'EEEE, MMMM d') : 'Select a day'}
                  </CardTitle>
                  <p className="text-muted-foreground pt-1">
                      {activeFilters.length === 3 
                        ? `${selectedDayEvents.length} item(s) scheduled`
                        : `${selectedDayEvents.length} filtered item(s)`
                      }
                  </p>
              </CardHeader>
              <CardContent className="w-full">
                  <FilterControls />
                  <div className="space-y-3 w-full mt-4">
                      {selectedDayEvents.length > 0 ? (
                          selectedDayEvents.map((event, index) => (
                              <GeneralItem key={index} event={event} />
                          ))
                      ) : (
                          <div className="text-center text-muted-foreground py-8">
                              {activeFilters.length === 3 ? (
                                  <p className="text-lg">No items for this day.</p>
                              ) : (
                                  <div className="space-y-2">
                                      <p className="text-lg">No {activeFilters.join(' or ')} for this day.</p>
                                      <p className="text-sm opacity-70">Try adjusting your filters above.</p>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </CardContent>
          </Card>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 w-full min-h-[calc(100vh-8rem)]">
          <div className="md:col-span-2 w-full min-w-0">
              <Card className="shadow-lg p-6 w-full h-full flex flex-col">
                <div className="flex-1 flex flex-col">
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="p-0 w-full h-full"
                      classNames={{
                      root: 'w-full h-full flex flex-col',
                      months: 'flex-1 flex flex-col h-full',
                      month: 'h-full flex flex-col',
                      caption: 'flex justify-center pt-1 relative items-center',
                      caption_label: 'text-xl font-bold',
                      nav: 'space-x-1 flex items-center',
                      nav_button: 'h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-md hover:bg-accent',
                      nav_button_previous: 'absolute left-1',
                      nav_button_next: 'absolute right-1',
                      table: 'w-full border-collapse space-y-1 flex-1 mt-6',
                      head_row: 'flex w-full justify-between',
                      head_cell: 'text-muted-foreground rounded-md w-full font-semibold text-sm flex-1 text-center py-2',
                      row: 'flex w-full',
                      cell: 'h-12 w-full text-center text-sm p-0 relative flex-1 flex items-center justify-center',
                      day: 'h-12 w-12 p-0 font-normal aria-selected:opacity-100 rounded-full transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:font-semibold aria-selected:scale-105 mx-auto',
                      day_today: 'bg-secondary font-bold text-secondary-foreground border-2 border-secondary',
                      day_disabled: 'text-muted-foreground/50',
                      day_range_end: 'day-range-end',
                      day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg',
                      day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                      }}
                      modifiers={{
                          tasks: taskDays,
                          events: eventDays
                      }}
                      modifiersClassNames={{ 
                          tasks: 'relative before:content-[""] before:absolute before:bottom-2 before:left-1/2 before:-translate-x-1/2 before:h-2.5 before:w-2.5 before:rounded-full before:bg-primary',
                          events: 'relative before:content-[""] before:absolute before:bottom-2 before:left-1/2 before:-translate-x-1/2 before:h-2.5 before:w-2.5 before:rounded-full before:bg-success'
                      }}
                  />
                </div>
              </Card>
          </div>

          <div className="md:col-span-1 w-full min-w-0 flex flex-col">
              <Card className="shadow-lg w-full flex-1 flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0">
                      <CardTitle className="text-2xl truncate">
                          {date ? format(date, 'EEEE, MMMM d') : 'Select a day'}
                      </CardTitle>
                      <p className="text-muted-foreground pt-1">
                          {activeFilters.length === 3 
                            ? `${selectedDayEvents.length} item(s) scheduled`
                            : `${selectedDayEvents.length} filtered item(s)`
                          }
                      </p>
                  </CardHeader>
                  <CardContent className="w-full flex-1 flex flex-col overflow-hidden">
                      <FilterControls />
                      <div className="flex-1 overflow-y-auto mt-4">
                          <div className="space-y-4 w-full pr-2">
                              {selectedDayEvents.length > 0 ? (
                                  selectedDayEvents.map((event, index) => (
                                      <GeneralItem key={index} event={event} />
                                  ))
                              ) : (
                                  <div className="text-center text-muted-foreground py-12">
                                      {activeFilters.length === 3 ? (
                                          <p className="text-lg">No items for this day.</p>
                                      ) : (
                                          <div className="space-y-3">
                                              <p className="text-lg">No {activeFilters.join(' or ')} for this day.</p>
                                              <p className="text-sm opacity-70">Try adjusting your filters above.</p>
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
