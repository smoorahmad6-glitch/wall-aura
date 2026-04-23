pub mod api {

    #[tauri::command]
    pub async fn update_wallpaper_content(
        monitor_index: usize,
        file_path: String,
    ) -> Result<String, String> {
        // Load and process the wallpaper file
        Ok(format!(
            "Wallpaper updated for monitor {}: {}",
            monitor_index, file_path
        ))
    }

    #[tauri::command]
    pub async fn get_shader_templates() -> Result<Vec<String>, String> {
        Ok(vec![
            "perlin_noise".to_string(),
            "plasma".to_string(),
            "waves".to_string(),
            "particles".to_string(),
        ])
    }
}
