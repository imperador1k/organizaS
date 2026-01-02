import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendTaskReminder } from '@/lib/onesignal';
import { Timestamp } from 'firebase-admin/firestore';

// Verify the request is from Vercel Cron
function verifyCronRequest(request: Request): boolean {
    const authHeader = request.headers.get('authorization');

    // In production, verify the CRON_SECRET
    if (process.env.CRON_SECRET) {
        return authHeader === `Bearer ${process.env.CRON_SECRET}`;
    }

    // In development, allow requests without auth
    return process.env.NODE_ENV === 'development';
}

interface Task {
    id: string;
    title: string;
    category: string;
    dueDate: Date;
    time?: string;
    completionDate?: Date;
    userId: string;
}

/**
 * GET /api/cron/task-reminders
 * 
 * This endpoint is called by Vercel Cron to send task reminder notifications.
 * It runs once daily at 9 AM and sends notifications for:
 * - Tasks due tomorrow (1 day reminder)
 * - Tasks due today (same day reminder)
 * 
 * For hourly reminders, a separate endpoint would be needed.
 */
export async function GET(request: Request) {
    // Verify the request
    if (!verifyCronRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getAdminDb();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // Get all users
        const usersSnapshot = await db.collection('users').get();

        const notifications: { type: string; task: string; result: unknown }[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;

            // Get user's tasks (without completionDate filter - we'll filter manually)
            const tasksSnapshot = await db
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .get();

            for (const taskDoc of tasksSnapshot.docs) {
                const taskData = taskDoc.data();

                // Skip completed tasks
                if (taskData.completionDate) {
                    continue;
                }

                // Convert Firestore Timestamp to Date
                let dueDate: Date;
                if (taskData.dueDate instanceof Timestamp) {
                    dueDate = taskData.dueDate.toDate();
                } else if (taskData.dueDate?.seconds) {
                    dueDate = new Date(taskData.dueDate.seconds * 1000);
                } else if (taskData.dueDate) {
                    dueDate = new Date(taskData.dueDate);
                } else {
                    continue; // Skip tasks without due date
                }

                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

                // Check if task is due today
                if (dueDateOnly.getTime() === today.getTime()) {
                    const result = await sendTaskReminder({
                        taskTitle: taskData.title,
                        category: taskData.category || 'other',
                        daysRemaining: 'today',
                        taskTime: taskData.time,
                        sendToAll: true, // For now, send to all (will improve with user targeting later)
                    });

                    notifications.push({
                        type: 'today',
                        task: taskData.title,
                        result,
                    });
                }
                // Check if task is due tomorrow
                else if (dueDateOnly.getTime() === tomorrow.getTime()) {
                    const result = await sendTaskReminder({
                        taskTitle: taskData.title,
                        category: taskData.category || 'other',
                        daysRemaining: 1,
                        taskTime: taskData.time,
                        sendToAll: true,
                    });

                    notifications.push({
                        type: 'tomorrow',
                        task: taskData.title,
                        result,
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            notificationsSent: notifications.length,
            details: notifications,
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Failed to process task reminders', details: (error as Error).message },
            { status: 500 }
        );
    }
}
