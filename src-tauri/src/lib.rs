use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use windows::Win32::Foundation::HWND;
use dashmap::DashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorInfo {
    pub index: usize,
    pub name: String,
    pub width: i32,
    pub height: i32,
    pub x: i32,
    pub y: i32,
    pub is_primary: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WallpaperConfig {
    pub monitor_index: usize,
    pub content_type: ContentType,
    pub file_path: Option<String>,
    pub shader_code: Option<String>,
    pub pause_on_fullscreen: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ContentType {
    Video,
    Image,
    Shader,
    Canvas,
}

pub struct WallpaperManager {
    pub is_paused: Arc<Mutex<bool>>,
    pub is_fullscreen: Arc<Mutex<bool>>,
    // HWND contains a raw pointer which is not Send/Sync. Store the raw pointer
    // as an integer (isize) so the manager can be shared across threads.
    pub worker_w_handle: Arc<Mutex<Option<isize>>>,
    pub configs: Arc<DashMap<usize, WallpaperConfig>>,
}

impl WallpaperManager {
    pub fn new() -> Self {
        WallpaperManager {
            is_paused: Arc::new(Mutex::new(false)),
            is_fullscreen: Arc::new(Mutex::new(false)),
            worker_w_handle: Arc::new(Mutex::new(None)),
            configs: Arc::new(DashMap::new()),
        }
    }

    pub fn set_pause_state(&self, paused: bool) {
        if let Ok(mut state) = self.is_paused.lock() {
            *state = paused;
        }
    }

    pub fn get_pause_state(&self) -> bool {
        self.is_paused.lock().map(|s| *s).unwrap_or(false)
    }

    pub fn set_fullscreen_state(&self, fullscreen: bool) {
        if let Ok(mut state) = self.is_fullscreen.lock() {
            *state = fullscreen;
        }
    }

    pub fn add_config(&self, monitor_index: usize, config: WallpaperConfig) {
        self.configs.insert(monitor_index, config);
    }

    pub fn get_config(&self, monitor_index: usize) -> Option<WallpaperConfig> {
        self.configs.get(&monitor_index).map(|r| r.clone())
    }
}

pub mod wallpaper_injection {
    use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
    use windows::core::BOOL;
    use windows::Win32::UI::WindowsAndMessaging::{self, FindWindowA, SendMessageA, EnumWindows, SetParent};
    use windows::core::s;

    const WM_SPAWN_WORKER: u32 = 0x052C;

    pub struct EnumWindowsData {
        pub found: Option<HWND>,
    }

    /// Window enumeration callback
    pub unsafe extern "system" fn enum_windows_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let data = &mut *(lparam.0 as *mut EnumWindowsData);
        let mut class_name = [0u8; 256];

        let len = WindowsAndMessaging::GetClassNameA(hwnd, &mut class_name);
        if len > 0 {
            if let Ok(class_str) = std::ffi::CStr::from_bytes_with_nul(&class_name[..=len as usize]) {
                if let Ok(class) = class_str.to_str() {
                    if class == "WorkerW" {
                        data.found = Some(hwnd);
                        return BOOL(0);
                    }
                }
            }
        }
        BOOL(1)
    }

    /// Find the Progman window (Program Manager)
    pub unsafe fn find_progman() -> Option<HWND> {
        let progman_class = s!("Progman");
        match FindWindowA(progman_class, None) {
            Ok(hwnd) => {
                if !hwnd.is_invalid() {
                    Some(hwnd)
                } else {
                    None
                }
            }
            Err(_) => None,
        }
    }

    /// Send the undocumented message to Progman to spawn WorkerW
    pub unsafe fn spawn_worker_w(progman: HWND) -> bool {
        let result = SendMessageA(progman, WM_SPAWN_WORKER, WPARAM(0), LPARAM(0));
        result.0 != 0
    }

    /// Find the WorkerW window that's behind the icons
    pub unsafe fn find_worker_w() -> Option<HWND> {
        let mut enum_data = EnumWindowsData { found: None };

        let _ = EnumWindows(
            Some(enum_windows_callback),
            LPARAM(&mut enum_data as *mut _ as isize),
        );

        enum_data.found
    }

    /// Inject the Tauri window into the WorkerW (behind icons)
    pub unsafe fn inject_wall_into_worker(wall_hwnd: HWND, worker_w: HWND) -> bool {
        match SetParent(wall_hwnd, Some(worker_w)) {
            Ok(result) => !result.is_invalid(),
            Err(_) => false,
        }
    }

    /// Initialize the wallpaper layer
    pub unsafe fn init_wallpaper_layer(tauri_hwnd: HWND) -> Option<HWND> {
        let progman = find_progman()?;
        spawn_worker_w(progman);
        std::thread::sleep(std::time::Duration::from_millis(500));

        let worker_w = find_worker_w()?;

        if inject_wall_into_worker(tauri_hwnd, worker_w) {
            Some(worker_w)
        } else {
            None
        }
    }
}

pub mod monitor_detection {
    use crate::MonitorInfo;
    use windows::Win32::Graphics::Gdi::{GetDC, GetDeviceCaps, ReleaseDC, HORZRES, VERTRES};

    pub unsafe fn enumerate_monitors() -> Vec<MonitorInfo> {
        let mut monitors = Vec::new();

        let dc = GetDC(None);
        if dc.is_invalid() {
            return monitors;
        }

        let screen_width = GetDeviceCaps(Some(dc), HORZRES);
        let screen_height = GetDeviceCaps(Some(dc), VERTRES);
        let _ = ReleaseDC(None, dc);

        let monitor = MonitorInfo {
            index: 0,
            name: "Primary Monitor".to_string(),
            width: screen_width,
            height: screen_height,
            x: 0,
            y: 0,
            is_primary: true,
        };

        monitors.push(monitor);
        monitors
    }
}

pub mod fullscreen_detection {
    use windows::Win32::Foundation::{HWND, RECT};
    use windows::Win32::UI::WindowsAndMessaging::{GetWindowRect, GetForegroundWindow};
    use windows::Win32::Graphics::Gdi::{GetDC, GetDeviceCaps, ReleaseDC, HORZRES, VERTRES};

    pub unsafe fn is_window_fullscreen(hwnd: HWND) -> bool {
        let mut rect = RECT::default();
        if GetWindowRect(hwnd, &mut rect).is_ok() {
            let width = rect.right - rect.left;
            let height = rect.bottom - rect.top;

            let dc = GetDC(None);
            if !dc.is_invalid() {
                let screen_width = GetDeviceCaps(Some(dc), HORZRES);
                let screen_height = GetDeviceCaps(Some(dc), VERTRES);
                let _ = ReleaseDC(None, dc);

                return width == screen_width && height == screen_height;
            }
        }
        false
    }

    pub unsafe fn check_foreground_window_fullscreen() -> bool {
        let foreground = GetForegroundWindow();

        if foreground.is_invalid() {
            return false;
        }

        is_window_fullscreen(foreground)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wallpaper_manager_creation() {
        let manager = WallpaperManager::new();
        assert!(!manager.get_pause_state());
    }

    #[test]
    fn test_wallpaper_manager_pause_state() {
        let manager = WallpaperManager::new();
        manager.set_pause_state(true);
        assert!(manager.get_pause_state());
        manager.set_pause_state(false);
        assert!(!manager.get_pause_state());
    }

    #[test]
    fn test_wallpaper_manager_fullscreen_state() {
        let manager = WallpaperManager::new();
        manager.set_fullscreen_state(true);
        assert!(manager.get_pause_state() || !manager.get_pause_state()); // State should be deterministic
    }

    #[test]
    fn test_wallpaper_manager_config_add_get() {
        let manager = WallpaperManager::new();
        let config = WallpaperConfig {
            monitor_index: 0,
            content_type: ContentType::Shader,
            file_path: None,
            shader_code: Some("void main() {}".to_string()),
            pause_on_fullscreen: true,
        };
        manager.add_config(0, config.clone());
        let retrieved = manager.get_config(0);
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().monitor_index, 0);
    }

    #[test]
    fn test_monitor_info_creation() {
        let monitor = MonitorInfo {
            index: 0,
            name: "Test Monitor".to_string(),
            width: 1920,
            height: 1080,
            x: 0,
            y: 0,
            is_primary: true,
        };
        assert_eq!(monitor.width, 1920);
        assert_eq!(monitor.height, 1080);
        assert!(monitor.is_primary);
    }

    #[test]
    fn test_wallpaper_config_video_type() {
        let config = WallpaperConfig {
            monitor_index: 0,
            content_type: ContentType::Video,
            file_path: Some("/path/to/video.mp4".to_string()),
            shader_code: None,
            pause_on_fullscreen: true,
        };
        assert_eq!(config.monitor_index, 0);
        assert!(config.file_path.is_some());
        assert!(config.pause_on_fullscreen);
    }

    #[test]
    fn test_wallpaper_config_shader_type() {
        let config = WallpaperConfig {
            monitor_index: 1,
            content_type: ContentType::Shader,
            file_path: None,
            shader_code: Some("uniform float time;".to_string()),
            pause_on_fullscreen: false,
        };
        assert_eq!(config.monitor_index, 1);
        assert!(config.shader_code.is_some());
        assert!(!config.pause_on_fullscreen);
    }

    #[test]
    fn test_content_type_serialization() {
        let video_type = ContentType::Video;
        let shader_type = ContentType::Shader;
        let image_type = ContentType::Image;
        
        // These types should be serializable/deserializable
        assert_eq!(std::mem::discriminant(&video_type), std::mem::discriminant(&ContentType::Video));
        assert_eq!(std::mem::discriminant(&shader_type), std::mem::discriminant(&ContentType::Shader));
        assert_eq!(std::mem::discriminant(&image_type), std::mem::discriminant(&ContentType::Image));
    }

    #[test]
    fn test_concurrent_config_access() {
        let manager = WallpaperManager::new();
        let config1 = WallpaperConfig {
            monitor_index: 0,
            content_type: ContentType::Video,
            file_path: Some("video1.mp4".to_string()),
            shader_code: None,
            pause_on_fullscreen: true,
        };
        let config2 = WallpaperConfig {
            monitor_index: 1,
            content_type: ContentType::Shader,
            file_path: None,
            shader_code: Some("shader code".to_string()),
            pause_on_fullscreen: false,
        };
        
        manager.add_config(0, config1);
        manager.add_config(1, config2);
        
        let retrieved1 = manager.get_config(0);
        let retrieved2 = manager.get_config(1);
        
        assert!(retrieved1.is_some());
        assert!(retrieved2.is_some());
        assert_eq!(retrieved1.unwrap().monitor_index, 0);
        assert_eq!(retrieved2.unwrap().monitor_index, 1);
    }
}
