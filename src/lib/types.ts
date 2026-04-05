import { z } from 'zod';

export type Day = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';
export type TimeOfDay = 'any' | 'morning' | 'afternoon' | 'evening';

export const HabitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required." }),
  icon: z.string().min(1, { message: "Icon is required."}),
  schedule: z.array(z.string()).min(1, { message: "At least one day must be selected." }),
  timeOfDay: z.enum(['any', 'morning', 'afternoon', 'evening']),
  goalType: z.enum(['duration', 'repetition', 'off']),
  goalValue: z.number().optional(),
  // For storing specific times on specific days, e.g., { '2024-05-21': '09:00' }
  schedule_time: z.record(z.string()).optional(),
});

export type Habit = z.infer<typeof HabitSchema> & { id?: string };


export const GoalSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    target: z.number(), 
    icon: z.string(),
});
export type Goal = z.infer<typeof GoalSchema> & { id?: string };


export type HabitCompletion = {
  [date: string]: {
    [habitId: string]: boolean;
  };
};

export const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  category: z.enum(["work", "personal", "wishlist", "birthday", "escola", "other"]),
  dueDate: z.date({ required_error: "Due date is required."}),
  time: z.string().optional(), // Added for scheduling (start time)
  endTime: z.string().optional(), // End time for scheduled tasks
  subtasks: z.array(z.object({ value: z.string() })).optional(),
  completionDate: z.date().optional(),
  attachmentUrl: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => !data.time || !data.endTime || data.time < data.endTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

export type Task = z.infer<typeof TaskSchema> & { id?: string };

export const EventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  icon: z.string().default('CalendarPlus'),
  importance: z.enum(["low", "medium", "high"]),
  date: z.date({
    required_error: "A date is required.",
  }),
  time: z.string().optional(), // Start time
  endTime: z.string().optional(), // End time for scheduled events
  notes: z.string().optional(),
  completed: z.boolean().default(false),
}).refine(data => !data.time || !data.endTime || data.time < data.endTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

export type AppEvent = z.infer<typeof EventSchema> & { id?: string };

export const BreakSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  icon: z.string().default('Coffee'),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:mm)"}),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:mm)"}),
}).refine(data => data.startTime < data.endTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

export type Break = z.infer<typeof BreakSchema> & { id?: string };

export type UserProfile = {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
};

// Type for items displayed on the schedule page
export type ScheduledItem = {
    id: string;         // A unique ID for the item instance on a specific day, e.g., `habitId-2024-05-21`
    originalId: string; // The original ID of the habit, task, or event
    type: 'habit' | 'task' | 'event' | 'break';
    title: string;
    icon: string;
    time?: string;      // The scheduled start time, e.g., "09:00"
    endTime?: string;  // The scheduled end time, e.g., "10:00"
};

// --- WORKSPACE & NOTION-LIKE ARCHITECTURE TYPES ---

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export type PageViewType = 'blocks' | 'kanban' | 'mindmap';

export interface WorkspacePage {
  id: string;
  workspaceId: string;
  name: string;
  icon?: string;
  parent?: string; // For nesting pages
  viewType: PageViewType;
  content?: string; // Tiptap JSON content or HTML
  createdAt: string;
  updatedAt: string;
  origin?: {
    type: 'kanban' | 'mindmap';
    pageId: string; // The ID of the Kanban or Mindmap page
    itemId: string; // The ID of the specific Kanban Card or Mindmap Node
  };
}

export interface Block {
  id: string;
  pageId: string;
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'task' | 'image' | 'code' | 'quote' | 'bullet_list_item' | 'ordered_list_item';
  content: Record<string, any>; // Flexible structure matching the TipTap or block editor format
  order: number;
  parent?: string;
}

export interface KanbanColumn {
  id: string;
  pageId: string;
  name: string;
  color?: string;
  order: number;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  properties: Record<string, any>;
  order: number;
  createdAt: string;
  updatedAt: string;
  linkedPageId?: string;
}

export interface MindMapNode {
  id: string;
  pageId: string;
  title: string;
  content?: string;
  color?: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  type?: string; 
}

export interface MindMapEdge {
  id: string;
  pageId: string;
  source: string; // node ID
  target: string; // node ID
  label?: string;
}

export interface InboxItem {
  id: string;
  content: string;
  attachments: { type: 'image' | 'excalidraw' | 'file'; url: string; name: string }[];
  createdAt: number;
}

