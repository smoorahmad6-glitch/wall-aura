fn main() {
    // This build script generates the Tauri context JSON into OUT_DIR so
    // `tauri::generate_context!()` can include it at compile time.
    tauri_build::build()
}
