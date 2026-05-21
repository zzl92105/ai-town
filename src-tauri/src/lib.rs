mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            storage::list_saves,
            storage::load_save,
            storage::upsert_save,
            storage::delete_save,
            storage::load_settings,
            storage::save_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
