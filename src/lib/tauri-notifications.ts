/**
 * Tauri Native Notifications Service
 *
 * Handles the communication between the Rust scheduler and the Firebase-powered frontend.
 * When the Rust scheduler emits "check-reminders", this service:
 * 1. Queries Firestore for pending tasks/events
 * 2. Builds notification payloads
 * 3. Sends them back to Rust via the "send_native_notifications" command
 */

import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { tauriInvoke, tauriListen, isTauri } from '@/lib/tauri-bridge';

interface PendingNotification {
  title: string;
  body: string;
}

/** Category display names in Portuguese */
const CATEGORY_MAP: Record<string, string> = {
  work: 'Trabalho',
  personal: 'Pessoal',
  wishlist: 'Lista de Desejos',
  birthday: 'Aniversário',
  escola: 'Escola',
  other: 'Outro',
};

/** Event countdown intervals (days) */
const EVENT_COUNTDOWN_DAYS = [10, 7, 3, 1, 0];

/** Importance emojis for events */
const IMPORTANCE_EMOJI: Record<string, string> = {
  low: '📅',
  medium: '📆',
  high: '🔥',
};

function firestoreToDate(field: unknown): Date | null {
  if (field instanceof Timestamp) return field.toDate();
  if (field && typeof field === 'object' && 'seconds' in field) {
    return new Date((field as { seconds: number }).seconds * 1000);
  }
  if (field) return new Date(field as string);
  return null;
}

function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Gather all pending notifications by querying Firestore for the current user's
 * tasks and events that are due soon.
 */
async function gatherPendingNotifications(): Promise<PendingNotification[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const notifications: PendingNotification[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    // === TASKS ===
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);

    for (const taskDoc of tasksSnapshot.docs) {
      const data = taskDoc.data();
      if (data.completionDate) continue;

      const dueDate = firestoreToDate(data.dueDate);
      if (!dueDate) continue;

      const daysUntilDue = getDaysDifference(today, dueDate);
      const categoryPt = CATEGORY_MAP[data.category] || data.category || 'Outro';
      const timeStr = data.time ? ` às ${data.time}` : '';

      if (daysUntilDue === 0) {
        notifications.push({
          title: '📌 Tarefa para Hoje!',
          body: `A tarefa "${data.title}" da categoria ${categoryPt} vence hoje${timeStr}!`,
        });
      } else if (daysUntilDue === 1) {
        notifications.push({
          title: '⏰ Falta 1 dia!',
          body: `A tarefa "${data.title}" da categoria ${categoryPt} vence amanhã${timeStr}!`,
        });
      }
    }

    // === EVENTS ===
    const eventsRef = collection(db, 'users', user.uid, 'events');
    const eventsSnapshot = await getDocs(eventsRef);

    for (const eventDoc of eventsSnapshot.docs) {
      const data = eventDoc.data();
      if (data.completed) continue;

      const eventDate = firestoreToDate(data.date);
      if (!eventDate) continue;

      const daysUntilEvent = getDaysDifference(today, eventDate);

      if (!EVENT_COUNTDOWN_DAYS.includes(daysUntilEvent)) continue;

      const emoji = IMPORTANCE_EMOJI[data.importance] || '📅';
      const timeStr = data.time ? ` às ${data.time}` : '';

      if (daysUntilEvent === 0) {
        notifications.push({
          title: `${emoji} Evento HOJE!`,
          body: `O evento "${data.title}" é hoje${timeStr}! Não te esqueças!`,
        });
      } else if (daysUntilEvent === 1) {
        notifications.push({
          title: `${emoji} Evento Amanhã!`,
          body: `O evento "${data.title}" é amanhã${timeStr}!`,
        });
      } else {
        notifications.push({
          title: `${emoji} Faltam ${daysUntilEvent} dias!`,
          body: `O evento "${data.title}" é daqui a ${daysUntilEvent} dias.`,
        });
      }
    }
  } catch (error) {
    console.error('[TauriNotifications] Error querying Firestore:', error);
  }

  return notifications;
}

/**
 * Initialize the notification listener.
 * Listens for the "check-reminders" event from the Rust scheduler,
 * gathers pending notifications, and sends them back to Rust.
 */
export async function initTauriNotifications(): Promise<(() => void) | null> {
  if (!isTauri()) return null;

  const unlisten = await tauriListen('check-reminders', async () => {
    console.log('[TauriNotifications] Received check-reminders event');

    const notifications = await gatherPendingNotifications();

    if (notifications.length === 0) {
      console.log('[TauriNotifications] No pending notifications');
      return;
    }

    console.log(`[TauriNotifications] Sending ${notifications.length} notifications`);

    const sentCount = await tauriInvoke<number>('send_native_notifications', {
      notifications,
    });

    console.log(`[TauriNotifications] ${sentCount} notifications sent successfully`);
  });

  return unlisten;
}

/**
 * Send a single native notification immediately (for manual triggers).
 * Falls back to browser Notification API if not in Tauri.
 */
export async function sendNativeNotification(
  title: string,
  body: string
): Promise<boolean> {
  if (isTauri()) {
    const result = await tauriInvoke<number>('send_native_notifications', {
      notifications: [{ title, body }],
    });
    return (result ?? 0) > 0;
  }

  // Fallback: browser Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
    return true;
  }

  return false;
}
