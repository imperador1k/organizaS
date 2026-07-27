mod scheduler;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            scheduler::send_native_notifications
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Spawn the background scheduler for task/event reminders
            scheduler::start_scheduler(app_handle);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running OrganizaS");
}

