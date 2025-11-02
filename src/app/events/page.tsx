'use client';

import { useState } from 'react';
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon, Clock, FileText, Trash2, Edit, Check, CheckCircle2, Circle, MoreVertical, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isPast, isToday, isTomorrow, isThisWeek, isThisMonth, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { AppEvent, EventSchema } from '@/lib/types';
import { EventModal } from '@/components/events/EventModal';
import { useAppData } from '@/context/AppDataContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Icon } from '@/components/dashboard/Dashboard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function EventsPage() {
    const { events, addEvent, updateEvent, deleteEvent, completeEvent } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        today: true,
        thisWeek: true,
        thisMonth: true,
        upcoming: true
    });

    const form = useForm<z.infer<typeof EventSchema>>({
        resolver: zodResolver(EventSchema),
        defaultValues: {
          title: "",
          icon: 'CalendarPlus',
          importance: "medium",
          notes: "",
          date: new Date(),
          time: "",
          completed: false,
        },
    });

    const handleCreateNew = () => {
        setEditingEvent(null);
        form.reset({
            title: "",
            icon: 'CalendarPlus',
            importance: "medium",
            notes: "",
            date: new Date(),
            time: "",
            completed: false,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (event: AppEvent) => {
        setEditingEvent(event);
        form.reset({
            ...event,
            date: new Date(event.date),
            time: event.time || "",
            notes: event.notes || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = (eventId: string) => {
        deleteEvent(eventId);
    };

    const handleComplete = (eventId: string) => {
        completeEvent(eventId);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getDateLabel = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isPast(date)) return format(date, 'MMM d, yyyy');
        return format(date, 'MMM d, yyyy');
    };

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'high': return 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800';
            case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800';
            case 'low': return 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800';
            default: return 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800';
        }
    };

    // Group events by time periods
    const groupedEvents = events.reduce((acc, event) => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
        const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
        const startOfThisMonth = startOfMonth(today);
        const endOfThisMonth = endOfMonth(today);

        // Today
        if (isToday(eventDate)) {
            acc.today.push(event);
        }
        // This week (excluding today)
        else if (isThisWeek(eventDate, { weekStartsOn: 1 }) && !isToday(eventDate)) {
            acc.thisWeek.push(event);
        }
        // This month (excluding this week)
        else if (isThisMonth(eventDate) && !isThisWeek(eventDate, { weekStartsOn: 1 })) {
            acc.thisMonth.push(event);
        }
        // Upcoming (future months)
        else if (eventDate > endOfThisMonth) {
            const monthKey = format(eventDate, 'yyyy-MM');
            if (!acc.upcoming[monthKey]) {
                acc.upcoming[monthKey] = {
                    label: format(eventDate, 'MMMM yyyy'),
                    events: []
                };
            }
            acc.upcoming[monthKey].events.push(event);
        }
        // Past events (we'll put these in a separate section)
        else {
            acc.past.push(event);
        }

        return acc;
    }, {
        today: [] as AppEvent[],
        thisWeek: [] as AppEvent[],
        thisMonth: [] as AppEvent[],
        upcoming: {} as Record<string, { label: string; events: AppEvent[] }>,
        past: [] as AppEvent[]
    });

    // Sort events within each group
    const sortEvents = (events: AppEvent[]) => {
        return [...events].sort((a, b) => {
            // Completed events go to the bottom
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            // Then sort by date
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    };

    // Sort upcoming months
    const sortedUpcomingMonths = Object.keys(groupedEvents.upcoming)
        .sort()
        .map(key => ({
            key,
            ...groupedEvents.upcoming[key]
        }));

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold">Your Events</h1>
                        <p className="text-muted-foreground mt-1">Organized schedule of your appointments and occasions.</p>
                    </div>
                </div>

                {/* Today Section */}
                <section className="space-y-4">
                    <div 
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => toggleSection('today')}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                            Today
                            <Badge className="ml-2" variant="secondary">
                                {groupedEvents.today.length}
                            </Badge>
                        </h2>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors"
                        >
                            <ChevronRight className={cn(
                                "h-5 w-5 transition-transform",
                                expandedSections.today ? "rotate-90" : "rotate-0"
                            )} />
                        </Button>
                    </div>
                    
                    {expandedSections.today && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {sortEvents(groupedEvents.today).map(event => (
                                <EventCard 
                                    key={event.id} 
                                    event={event} 
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onComplete={handleComplete}
                                    getDateLabel={getDateLabel}
                                    getImportanceColor={getImportanceColor}
                                />
                            ))}
                            {groupedEvents.today.length === 0 && (
                                <div className="col-span-full py-8 text-center">
                                    <p className="text-muted-foreground">No events scheduled for today</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* This Week Section */}
                <section className="space-y-4">
                    <div 
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => toggleSection('thisWeek')}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                            This Week
                            <Badge className="ml-2" variant="secondary">
                                {groupedEvents.thisWeek.length}
                            </Badge>
                        </h2>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors"
                        >
                            <ChevronRight className={cn(
                                "h-5 w-5 transition-transform",
                                expandedSections.thisWeek ? "rotate-90" : "rotate-0"
                            )} />
                        </Button>
                    </div>
                    
                    {expandedSections.thisWeek && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {sortEvents(groupedEvents.thisWeek).map(event => (
                                <EventCard 
                                    key={event.id} 
                                    event={event} 
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onComplete={handleComplete}
                                    getDateLabel={getDateLabel}
                                    getImportanceColor={getImportanceColor}
                                />
                            ))}
                            {groupedEvents.thisWeek.length === 0 && (
                                <div className="col-span-full py-8 text-center">
                                    <p className="text-muted-foreground">No events scheduled for this week</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* This Month Section */}
                <section className="space-y-4">
                    <div 
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => toggleSection('thisMonth')}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                            Later This Month
                            <Badge className="ml-2" variant="secondary">
                                {groupedEvents.thisMonth.length}
                            </Badge>
                        </h2>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors"
                        >
                            <ChevronRight className={cn(
                                "h-5 w-5 transition-transform",
                                expandedSections.thisMonth ? "rotate-90" : "rotate-0"
                            )} />
                        </Button>
                    </div>
                    
                    {expandedSections.thisMonth && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {sortEvents(groupedEvents.thisMonth).map(event => (
                                <EventCard 
                                    key={event.id} 
                                    event={event} 
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onComplete={handleComplete}
                                    getDateLabel={getDateLabel}
                                    getImportanceColor={getImportanceColor}
                                />
                            ))}
                            {groupedEvents.thisMonth.length === 0 && (
                                <div className="col-span-full py-8 text-center">
                                    <p className="text-muted-foreground">No events scheduled for later this month</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Upcoming Months Section */}
                <section className="space-y-4">
                    <div 
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => toggleSection('upcoming')}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                            Upcoming
                            <Badge className="ml-2" variant="secondary">
                                {Object.values(groupedEvents.upcoming).reduce((acc, month) => acc + month.events.length, 0)}
                            </Badge>
                        </h2>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors"
                        >
                            <ChevronRight className={cn(
                                "h-5 w-5 transition-transform",
                                expandedSections.upcoming ? "rotate-90" : "rotate-0"
                            )} />
                        </Button>
                    </div>
                    
                    {expandedSections.upcoming && sortedUpcomingMonths.length > 0 && (
                        <div className="space-y-8">
                            {sortedUpcomingMonths.map((month) => (
                                <div key={month.key} className="space-y-4">
                                    <h3 className="text-xl font-semibold text-muted-foreground border-b pb-2">
                                        {month.label}
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {sortEvents(month.events).map(event => (
                                            <EventCard 
                                                key={event.id} 
                                                event={event} 
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onComplete={handleComplete}
                                                getDateLabel={getDateLabel}
                                                getImportanceColor={getImportanceColor}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {expandedSections.upcoming && sortedUpcomingMonths.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">No upcoming events scheduled</p>
                        </div>
                    )}
                </section>

                {/* No Events State */}
                {events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">No Events Yet</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Start organizing your schedule by creating your first event. Keep track of appointments, meetings, and important dates.
                        </p>
                        <Button 
                            onClick={handleCreateNew}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Event
                        </Button>
                    </div>
                )}
            </div>

            {events.length > 0 && (
                <Button
                    onClick={handleCreateNew}
                    className="fixed bottom-24 right-6 md:bottom-10 md:right-10 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 z-40 border-4 border-background"
                    size="icon"
                >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Add new event</span>
                </Button>
            )}

            <EventModal
                form={form}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                editingEvent={editingEvent}
                onEventSubmit={(data) => {
                    if (editingEvent) {
                        updateEvent({ ...editingEvent, ...data });
                    } else {
                        addEvent(data);
                    }
                }}
            />
        </AppLayout>
    )
}

// Event Card Component
function EventCard({ 
    event, 
    onEdit, 
    onDelete, 
    onComplete,
    getDateLabel,
    getImportanceColor
}: { 
    event: AppEvent; 
    onEdit: (event: AppEvent) => void;
    onDelete: (id: string) => void;
    onComplete: (id: string) => void;
    getDateLabel: (date: Date) => string;
    getImportanceColor: (importance: string) => string;
}) {
    return (
        <Card 
            key={event.id} 
            className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-background to-muted/20",
                event.completed && "opacity-60 scale-[0.98]"
            )}
        >
            {/* Completion Status Indicator */}
            <div className="absolute top-4 right-4 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 rounded-full transition-all duration-200",
                        event.completed 
                            ? "bg-green-500 text-white hover:bg-green-600" 
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => onComplete(event.id!)}
                >
                    {event.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <Circle className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <CardHeader className="pb-3">
                <div className="flex items-start gap-3 pr-12">
                    <div className={cn(
                        "flex-shrink-0 p-2 rounded-xl transition-all duration-200",
                        event.completed 
                            ? "bg-muted/50" 
                            : "bg-primary/10 group-hover:bg-primary/20"
                    )}>
                        <Icon 
                            name={event.icon} 
                            className={cn(
                                "h-5 w-5 transition-colors duration-200",
                                event.completed 
                                    ? "text-muted-foreground" 
                                    : "text-primary"
                            )} 
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className={cn(
                            "text-lg font-semibold leading-tight transition-all duration-200",
                            event.completed && "line-through text-muted-foreground"
                        )}>
                            {event.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                                getImportanceColor(event.importance),
                                event.completed && "opacity-50"
                            )}>
                                {event.importance}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4">
                <div className="space-y-3">
                    {/* Date and Time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">{getDateLabel(new Date(event.date))}</span>
                        {event.time && (
                            <>
                                <span className="text-muted-foreground/50">•</span>
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>{event.time}</span>
                            </>
                        )}
                    </div>

                    {/* Notes */}
                    {event.notes && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed">{event.notes}</p>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-0 pb-4 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 px-3 text-xs hover:bg-muted/50"
                        onClick={() => onEdit(event)}
                    >
                        <Edit className="h-3 w-3 mr-1.5" />
                        Edit
                    </Button>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onComplete(event.id!)}>
                            {event.completed ? (
                                <>
                                    <Circle className="h-4 w-4 mr-2" />
                                    Mark as Pending
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as Complete
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(event)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Event
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => onDelete(event.id!)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}