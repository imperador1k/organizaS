
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format, subDays, startOfDay, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';

type CombinedItem = {
  id: string;
  type: 'habit' | 'task' | 'event';
  title: string;
  icon: string;
};

type WeeklyProgressChartProps = {
  getDailyItems: (date: Date) => CombinedItem[];
  completions: Record<string, boolean>;
  allTasks: any[];
};

export function WeeklyProgressChart({ getDailyItems, completions, allTasks }: WeeklyProgressChartProps) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  const chartData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

    return weekDays.map(day => {
      const items = getDailyItems(day);
      const total = items.length;
      
      const completed = items.filter(item => {
        const completionKey = `${item.id}-${format(day, 'yyyy-MM-dd')}`;
        let isCompleted = completions[completionKey] || false;
        
        // For tasks, also check if they have a completionDate
        if (item.type === 'task') {
          const task = allTasks.find(t => t.id === item.id);
          if (task && task.completionDate && isSameDay(task.completionDate, day)) {
            isCompleted = true;
          }
        }
        
        return isCompleted;
      }).length;
      
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        name: format(day, isMobile ? 'E' : 'EEE'),
        date: format(day, 'do MMM'),
        completed,
        total,
        percentage: Math.round(percentage),
      };
    });
  }, [getDailyItems, completions, isMobile]);
  
  const primaryColor = theme === 'dark' ? 'hsl(262.1 83.3% 57.8%)' : 'hsl(262.1 83.3% 57.8%)';
  const mutedColor = theme === 'dark' ? 'hsl(240 3.7% 15.9%)' : 'hsl(240 4.8% 95.9%)';
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {data.name} ({data.date})
              </span>
              <span className="font-bold text-muted-foreground">
                {data.completed} / {data.total} completed
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke={theme === 'dark' ? '#888' : '#aaa'}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={theme === 'dark' ? '#888' : '#aaa'}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: mutedColor, radius: 4 }}
          />
          <Bar
            dataKey="percentage"
            fill={primaryColor}
            radius={[4, 4, 0, 0]}
            background={{ fill: mutedColor, radius: 4 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
