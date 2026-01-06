import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendTaskReminder, sendEventReminder } from '@/lib/onesignal';
import { Timestamp } from 'firebase-admin/firestore';

// Balanced countdown intervals for events
const EVENT_COUNTDOWN_DAYS = [10, 7, 3, 1, 0]; // 0 = today

// Helper to convert Firestore date to Date
function firestoreToDate(field: any): Date | null {
    if (field instanceof Timestamp) {
        return field.toDate();
    } else if (field?.seconds) {
        return new Date(field.seconds * 1000);
    } else if (field) {
        return new Date(field);
    }
    return null;
}

// Helper to calculate days difference
function getDaysDifference(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * GET /api/cron/task-reminders/test
 * 
 * Endpoint de TESTE para verificar se as notificações funcionam.
 * NÃO requer autenticação - apenas para debugging.
 */
export async function GET() {
    try {
        const db = getAdminDb();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Get all users
        const usersSnapshot = await db.collection('users').get();

        const taskNotifications: { type: string; title: string; result: unknown }[] = [];
        const eventNotifications: { type: string; title: string; daysRemaining: number | string; result: unknown }[] = [];
        const eventsFound: { title: string; date: string; daysUntil: number; completed: boolean; shouldNotify: boolean }[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;

            // ========== PROCESS TASKS ==========
            const tasksSnapshot = await db
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .get();

            for (const taskDoc of tasksSnapshot.docs) {
                const taskData = taskDoc.data();
                if (taskData.completionDate) continue;

                const dueDate = firestoreToDate(taskData.dueDate);
                if (!dueDate) continue;

                const daysUntilDue = getDaysDifference(today, dueDate);

                if (daysUntilDue === 0) {
                    const result = await sendTaskReminder({
                        taskTitle: taskData.title,
                        category: taskData.category || 'other',
                        daysRemaining: 'today',
                        taskTime: taskData.time,
                        sendToAll: true,
                    });
                    taskNotifications.push({ type: 'today', title: taskData.title, result });
                } else if (daysUntilDue === 1) {
                    const result = await sendTaskReminder({
                        taskTitle: taskData.title,
                        category: taskData.category || 'other',
                        daysRemaining: 1,
                        taskTime: taskData.time,
                        sendToAll: true,
                    });
                    taskNotifications.push({ type: 'tomorrow', title: taskData.title, result });
                }
            }

            // ========== PROCESS EVENTS ==========
            const eventsSnapshot = await db
                .collection('users')
                .doc(userId)
                .collection('events')
                .get();

            for (const eventDoc of eventsSnapshot.docs) {
                const eventData = eventDoc.data();
                const eventDate = firestoreToDate(eventData.date);

                if (!eventDate) continue;

                const daysUntilEvent = getDaysDifference(today, eventDate);
                const shouldNotify = EVENT_COUNTDOWN_DAYS.includes(daysUntilEvent) && !eventData.completed;

                // Log all events for debugging
                eventsFound.push({
                    title: eventData.title,
                    date: eventDate.toISOString(),
                    daysUntil: daysUntilEvent,
                    completed: !!eventData.completed,
                    shouldNotify,
                });

                // Only notify on specific countdown days and if not completed
                if (shouldNotify) {
                    const result = await sendEventReminder({
                        eventTitle: eventData.title,
                        importance: eventData.importance || 'medium',
                        daysRemaining: daysUntilEvent === 0 ? 'today' : daysUntilEvent,
                        eventTime: eventData.time,
                        sendToAll: true,
                    });
                    eventNotifications.push({
                        type: 'event',
                        title: eventData.title,
                        daysRemaining: daysUntilEvent === 0 ? 'today' : daysUntilEvent,
                        result,
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Teste de notificações executado!',
            timestamp: now.toISOString(),
            todayDate: today.toISOString(),
            countdownDays: EVENT_COUNTDOWN_DAYS,
            tasks: {
                notificationsSent: taskNotifications.length,
                details: taskNotifications,
            },
            events: {
                notificationsSent: eventNotifications.length,
                eventsFound,
                details: eventNotifications,
            },
        });

    } catch (error) {
        console.error('Test cron error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process reminders',
                details: (error as Error).message,
                stack: (error as Error).stack,
            },
            { status: 500 }
        );
    }
}
