/// Background scheduler for task and event reminders.
///
/// Emits an IPC event ("check-reminders") to the frontend every hour.
/// The frontend queries Firebase Firestore for pending tasks/events
/// and responds with a list of notifications to send.
/// The scheduler then dispatches native Windows Toast notifications.

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tauri_plugin_notification::NotificationExt;
use std::time::Duration;

/// Interval between reminder checks (1 hour)
const CHECK_INTERVAL_SECS: u64 = 3600;

/// Initial delay before the first check (30 seconds after app start)
const INITIAL_DELAY_SECS: u64 = 30;

/// A pending notification received from the frontend
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PendingNotification {
    pub title: String,
    pub body: String,
}

/// The payload the frontend sends back with pending notifications
#[allow(dead_code)]
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ReminderResponse {
    pub notifications: Vec<PendingNotification>,
}

/// Start the background scheduler in a Tokio task.
/// This function is non-blocking and returns immediately.
pub fn start_scheduler(app_handle: AppHandle) {
    tauri::async_runtime::spawn(async move {
        // Wait a bit before the first check to let the frontend initialize
        tokio::time::sleep(Duration::from_secs(INITIAL_DELAY_SECS)).await;

        loop {
            log::info!("[Scheduler] Emitting 'check-reminders' event to frontend");

            // Emit the event to the frontend — the frontend will query Firebase
            // and call back with the list of notifications via a Tauri command
            if let Err(e) = app_handle.emit("check-reminders", ()) {
                log::error!("[Scheduler] Failed to emit check-reminders event: {}", e);
            }

            // Wait for the next check interval
            tokio::time::sleep(Duration::from_secs(CHECK_INTERVAL_SECS)).await;
        }
    });
}

/// Tauri command called by the frontend to send native notifications.
/// The frontend gathers pending tasks/events from Firebase and sends them here.
#[tauri::command]
pub fn send_native_notifications(
    app_handle: AppHandle,
    notifications: Vec<PendingNotification>,
) -> Result<usize, String> {
    let mut sent_count = 0;

    for notif in &notifications {
        match app_handle
            .notification()
            .builder()
            .title(&notif.title)
            .body(&notif.body)
            .show()
        {
            Ok(_) => {
                sent_count += 1;
                log::info!("[Scheduler] Sent notification: {}", notif.title);
            }
            Err(e) => {
                log::error!(
                    "[Scheduler] Failed to send notification '{}': {}",
                    notif.title,
                    e
                );
            }
        }
    }

    Ok(sent_count)
}
