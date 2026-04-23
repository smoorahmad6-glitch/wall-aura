use tauri::Window;
use windows::Win32::Foundation::HWND;

pub fn get_window_handle(window: &Window) -> HWND {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::Foundation::HWND;
        use std::os::windows::ffi::OsStrExt;

        let hwnd = window.hwnd().expect("Failed to get hwnd");
        HWND(hwnd.0)
    }

    #[cfg(not(target_os = "windows"))]
    {
        panic!("This application only runs on Windows");
    }
}
