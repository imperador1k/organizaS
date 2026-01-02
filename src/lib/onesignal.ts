/**
 * OneSignal Push Notification Service
 * Used for sending push notifications via OneSignal API
 */

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!;

interface NotificationPayload {
    title: string;
    message: string;
    // Target specific users by their external_id (Firebase UID)
    externalUserIds?: string[];
    // Or send to all subscribers
    sendToAll?: boolean;
    // Optional: URL to open when notification is clicked
    url?: string;
    // Optional: Additional data
    data?: Record<string, string>;
}

interface OneSignalResponse {
    id?: string;
    recipients?: number;
    errors?: string[];
}

/**
 * Send a push notification via OneSignal
 */
export async function sendPushNotification(payload: NotificationPayload): Promise<OneSignalResponse> {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
        console.error('OneSignal credentials not configured');
        return { errors: ['OneSignal credentials not configured'] };
    }

    const body: Record<string, unknown> = {
        app_id: ONESIGNAL_APP_ID,
        headings: { en: payload.title, pt: payload.title },
        contents: { en: payload.message, pt: payload.message },
    };

    // Target specific users or all
    if (payload.externalUserIds && payload.externalUserIds.length > 0) {
        body.include_aliases = {
            external_id: payload.externalUserIds
        };
        body.target_channel = 'push';
    } else if (payload.sendToAll) {
        body.included_segments = ['All'];
    } else {
        return { errors: ['No target specified'] };
    }

    // Optional URL
    if (payload.url) {
        body.url = payload.url;
    }

    // Optional data
    if (payload.data) {
        body.data = payload.data;
    }

    try {
        const response = await fetch('https://api.onesignal.com/notifications', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${ONESIGNAL_REST_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('OneSignal API error:', result);
            return { errors: result.errors || ['Unknown error'] };
        }

        return {
            id: result.id,
            recipients: result.recipients,
        };
    } catch (error) {
        console.error('Failed to send notification:', error);
        return { errors: [(error as Error).message] };
    }
}

/**
 * Send a task reminder notification
 */
export async function sendTaskReminder(params: {
    taskTitle: string;
    category: string;
    daysRemaining: number | 'today' | 'soon';
    taskTime?: string;
    externalUserIds?: string[];
    sendToAll?: boolean;
}): Promise<OneSignalResponse> {
    const { taskTitle, category, daysRemaining, taskTime, externalUserIds, sendToAll } = params;

    // Category translation
    const categoryMap: Record<string, string> = {
        work: 'Trabalho',
        personal: 'Pessoal',
        wishlist: 'Lista de Desejos',
        birthday: 'Aniversário',
        escola: 'Escola',
        other: 'Outro',
    };

    const categoryPt = categoryMap[category] || category;

    // Build message based on time remaining
    let title: string;
    let message: string;

    if (daysRemaining === 'today') {
        title = '📌 Tarefa para Hoje!';
        message = `A tarefa "${taskTitle}" da categoria ${categoryPt} vence hoje${taskTime ? ` às ${taskTime}` : ''}!`;
    } else if (daysRemaining === 'soon') {
        title = '⏰ Tarefa em Breve!';
        message = `A tarefa "${taskTitle}" da categoria ${categoryPt} vence em menos de 1 hora!`;
    } else if (daysRemaining === 1) {
        title = '⏰ Falta 1 dia!';
        message = `A tarefa "${taskTitle}" da categoria ${categoryPt} vence amanhã${taskTime ? ` às ${taskTime}` : ''}!`;
    } else {
        title = `📅 Faltam ${daysRemaining} dias!`;
        message = `A tarefa "${taskTitle}" da categoria ${categoryPt} vence em ${daysRemaining} dias.`;
    }

    return sendPushNotification({
        title,
        message,
        externalUserIds,
        sendToAll,
        data: {
            type: 'task_reminder',
            daysRemaining: String(daysRemaining),
        },
    });
}
