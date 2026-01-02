import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendTaskReminder } from '@/lib/onesignal';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * GET /api/cron/task-reminders/test
 * 
 * Endpoint de TESTE para verificar se as notificações funcionam.
 * NÃO usar em produção - apenas para debugging.
 * 
 * Este endpoint NÃO requer autenticação (apenas para testes).
 */
export async function GET() {
    try {
        const db = getAdminDb();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all users
        const usersSnapshot = await db.collection('users').get();

        const notifications: { type: string; task: string; userId: string; result: unknown }[] = [];
        const tasksFound: { title: string; dueDate: string; completionDate: string; rawDueDate: string; userId: string }[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;

            // Get user's tasks - get ALL tasks for debugging (removed completionDate filter)
            const tasksSnapshot = await db
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .get();

            for (const taskDoc of tasksSnapshot.docs) {
                const taskData = taskDoc.data();

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

                tasksFound.push({
                    title: taskData.title,
                    dueDate: dueDate.toISOString(),
                    completionDate: taskData.completionDate ? 'has value' : 'null/undefined',
                    rawDueDate: JSON.stringify(taskData.dueDate),
                    userId,
                });

                // Check if task is due today
                if (dueDateOnly.getTime() === today.getTime()) {
                    const result = await sendTaskReminder({
                        taskTitle: taskData.title,
                        category: taskData.category || 'other',
                        daysRemaining: 'today',
                        taskTime: taskData.time,
                        sendToAll: true,
                    });

                    notifications.push({
                        type: 'today',
                        task: taskData.title,
                        userId,
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
                        userId,
                        result,
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Teste de notificações executado!',
            timestamp: now.toISOString(),
            debug: {
                today: today.toISOString(),
                tomorrow: tomorrow.toISOString(),
                usersCount: usersSnapshot.size,
                tasksFound,
            },
            notificationsSent: notifications.length,
            notifications,
        });

    } catch (error) {
        console.error('Test cron error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process task reminders',
                details: (error as Error).message,
                stack: (error as Error).stack,
            },
            { status: 500 }
        );
    }
}
