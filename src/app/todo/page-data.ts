import { Task } from "@/lib/types";

export const initialTodayTasks: (Task & { description: string, notes?: string })[] = [];

export const initialUpcomingTasks: (Task & { description: string, notes?: string })[] = [];

export const initialCompletedTasks: (Task & { description: string, completionDate?: Date })[] = [];
