
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Target,
  Settings,
  ClipboardList,
  Calendar,
  Clock,
  CalendarDays,
  BookOpen,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { useAppData, useAuth } from '@/context/AppDataContext';
import { isSameDay } from 'date-fns';


const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/goals', label: 'Habits', icon: Target },
  { href: '/todo', label: 'To-Do', icon: ClipboardList },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/schedule', label: 'Schedule', icon: Clock },
  { href: '/study', label: 'Study', icon: BookOpen },
];

function DesktopNav() {
    const pathname = usePathname();
    return (
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium bg-secondary p-1 rounded-lg">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-all duration-300 px-4 py-1.5 rounded-md",
                  pathname === item.href ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
        </nav>
    );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const { tasks, habits, events } = useAppData();
  const today = new Date();

  const getTodayCount = (type: 'task' | 'habit' | 'event') => {
    switch (type) {
        case 'task':
            return tasks.filter(t => t.dueDate && isSameDay(t.dueDate, today) && !t.completionDate).length;
        case 'habit':
            const dayOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][today.getDay()];
            return habits.filter(h => h.schedule.includes(dayOfWeek)).length;
        case 'event':
            return events.filter(e => isSameDay(e.date, today)).length;
        default:
            return 0;
    }
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 flex items-center justify-between px-1 overflow-hidden">
      {menuItems.map((item) => {
        const isSelected = pathname === item.href;
        let badgeCount = 0;
        if (item.href === '/todo') badgeCount = getTodayCount('task');
        if (item.href === '/events') badgeCount = getTodayCount('event');
        
        return (
            <Link
            key={item.href}
            href={item.href}
            className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 transition-colors flex-1 min-w-0 h-full py-1",
                isSelected ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] leading-tight text-center truncate w-full px-0.5">{item.label}</span>

                {badgeCount > 0 && (
                    <span className="absolute top-1 right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {badgeCount}
                    </span>
                )}
            </Link>
        )
      })}
    </nav>
  );
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <h1 className="text-xl font-bold text-foreground">OrganizaS</h1>
            </Link>
          </div>
          
          <div className="flex-1 flex justify-center">
            <DesktopNav />
          </div>

          <div className="flex items-center gap-4">
             <Link href="/settings">
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary transition-colors">
                    <AvatarImage src={userProfile?.photoURL || '/placeholder-user.png'} alt="User Avatar" />
                    <AvatarFallback>{userProfile?.displayName?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col pb-20 md:pb-0">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
                 {children}
            </div>
        </main>        
        <MobileBottomNav />
    </div>
  );
}
