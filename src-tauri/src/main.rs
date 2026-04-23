use tauri::{Manager, Emitter}; 
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

mod windows_integration;
mod commands;

use wall_aura_lib::{
    WallpaperManager,
    monitor_detection,
    fullscreen_detection,
};

// تعريف الـ Static 
static WALLPAPER_MANAGER: once_cell::sync::Lazy<Arc<WallpaperManager>> =
    once_cell::sync::Lazy::new(|| Arc::new(WallpaperManager::new()));

#[tauri::command]
async fn init_wallpaper() -> Result<String, String> {
    Ok("Wallpaper layer ready for initialization".to_string())
}

#[tauri::command]
async fn get_monitors() -> Result<Vec<wall_aura_lib::MonitorInfo>, String> {
    unsafe {
        Ok(monitor_detection::enumerate_monitors())
    }
}

#[tauri::command]
async fn set_wallpaper_config(
    monitor_index: usize,
    config: wall_aura_lib::WallpaperConfig,
) -> Result<String, String> {
    WALLPAPER_MANAGER.add_config(monitor_index, config);
    Ok("Config set successfully".to_string())
}

#[tauri::command]
async fn toggle_pause(paused: bool) -> Result<String, String> {
    WALLPAPER_MANAGER.set_pause_state(paused);
    Ok(format!("Wallpaper paused: {}", paused))
}

#[tauri::command]
async fn get_pause_state() -> Result<bool, String> {
    Ok(WALLPAPER_MANAGER.get_pause_state())
}

#[tauri::command]
async fn get_fullscreen_state() -> Result<bool, String> {
    unsafe {
        Ok(fullscreen_detection::check_foreground_window_fullscreen())
    }
}

fn main() {
    env_logger::init();

    let manager = WALLPAPER_MANAGER.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init()) 
        .plugin(tauri_plugin_dialog::init()) // <--- هذا السطر هو مفتاح الحل لفتح الملفات
        .invoke_handler(tauri::generate_handler![
            init_wallpaper,
            get_monitors,
            set_wallpaper_config,
            toggle_pause,
            get_pause_state,
            get_fullscreen_state,
        ])
        .setup(move |app| {
            let app_handle = app.app_handle().clone();
            let mgr = manager.clone();

            tauri::async_runtime::spawn(async move {
                loop {
                    sleep(Duration::from_millis(2000)).await;
                    unsafe {
                        let is_fullscreen = fullscreen_detection::check_foreground_window_fullscreen();
                        
                        if is_fullscreen && !mgr.get_pause_state() {
                            mgr.set_pause_state(true);
                            let _ = app_handle.emit("fullscreen_detected", true);
                        } else if !is_fullscreen && mgr.get_pause_state() {
                            mgr.set_pause_state(false);
                            let _ = app_handle.emit("fullscreen_detected", false);
                        }
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}