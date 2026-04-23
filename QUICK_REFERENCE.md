# Wall Aura - Quick Reference

## Command Reference

### Development
```bash
npm install          # Install all dependencies
npm run tauri:dev    # Start development mode
npm run build        # Build React frontend
npm run type-check   # Check TypeScript errors
```

### Production
```bash
npm run tauri:build  # Build production executable
npm run tauri build  # Alias
```

### File Structure
```
wall-aura/
├── src-tauri/           Rust backend (Tauri)
│   ├── lib.rs           Core wallpaper logic
│   ├── main.rs          App entry point
│   └── Cargo.toml       Rust deps
├── src/                 React frontend
│   ├── components/      React components
│   └── App.tsx          Main component
├── Cargo.toml           Root Rust config
├── package.json         Root Node config
└── tauri.conf.json      Tauri config
```

## Tauri Commands

| Command | Parameters | Returns | Purpose |
|---------|-----------|---------|---------|
| `init_wallpaper` | none | Status | Initialize wallpaper layer |
| `get_monitors` | none | MonitorInfo[] | Get all displays |
| `set_wallpaper_config` | (index, config) | Status | Configure monitor |
| `toggle_pause` | (bool) | Status | Pause/resume |
| `get_pause_state` | none | bool | Get pause status |
| `get_fullscreen_state` | none | bool | Check fullscreen |

## Key Files & Their Purpose

### Backend (Rust)

| File | Purpose |
|------|---------|
| `src-tauri/lib.rs` | **CRITICAL** - WorkerW injection, fullscreen detection, monitor enumeration |
| `src-tauri/main.rs` | Tauri setup, command handlers, fullscreen loop |
| `src-tauri/windows_integration.rs` | Win32 HWND extraction |
| `src-tauri/shaders.rs` | Shader templates & compilation |

### Frontend (React)

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app, initialization, event listeners |
| `src/components/Dashboard.tsx` | Status & overview display |
| `src/components/MonitorSelector.tsx` | Display mode & per-monitor config |
| `src/components/ContentManager.tsx` | File upload & content selection |
| `src/components/ShaderEditor.tsx` | GLSL editor & templates |

## Key Concepts

### WorkerW Injection (Most Important!)
```
Progman Window (Program Manager)
  ↓
Send Message 0x052C to spawn WorkerW
  ↓
Find WorkerW window (behind icons)
  ↓
SetParent(our_window, worker_w)
  ↓
✓ Our window is now behind desktop icons!
```

### Fullscreen Detection Loop
```
Every 500ms:
  ↓
GetForegroundWindow() → Get active window
  ↓
GetWindowRect() → Get its dimensions
  ↓
Compare to screen resolution
  ↓
If fullscreen: PAUSE rendering (→ 0% CPU/GPU)
  ↓
If windowed: RESUME rendering
```

### Multi-Monitor Handling
```
Get Screen Resolution via GetDeviceCaps()
  ↓
Store in MonitorInfo {
    index: usize,
    name: String,
    width: i32,
    height: i32,
    x: i32,
    y: i32,
    is_primary: bool,
}
  ↓
Per-Monitor Mode: Different content per display
Span Mode: Single content across all displays
  ↓
Calculate virtual desktop coordinates
```

## Data Structures

### MonitorInfo
```rust
pub struct MonitorInfo {
    pub index: usize,           // Monitor number (0 = primary)
    pub name: String,           // "Monitor 1", "HDMI-1", etc.
    pub width: i32,             // Screen width in pixels
    pub height: i32,            // Screen height in pixels
    pub x: i32,                 // X position in virtual desktop
    pub y: i32,                 // Y position in virtual desktop
    pub is_primary: bool,       // Is this the primary monitor?
}
```

### WallpaperConfig
```rust
pub struct WallpaperConfig {
    pub monitor_index: usize,           // Which monitor
    pub content_type: ContentType,      // Video/Image/Shader
    pub file_path: Option<String>,      // Path to content
    pub shader_code: Option<String>,    // Shader code if type=Shader
    pub pause_on_fullscreen: bool,      // Auto-pause setting
}
```

### ContentType Enum
```rust
pub enum ContentType {
    Video,          // MP4, WebM, AVI, MKV
    Image,          // PNG, JPG, BMP, GIF
    Shader,         // GLSL code
    Canvas,         // HTML5 Canvas (future)
}
```

## GLSL Shader Template

All shaders must have:
```glsl
#version 430
precision highp float;

uniform float iTime;        // Elapsed time
uniform vec3 iResolution;   // Screen width, height, aspect

void main() {
    vec2 uv = gl_FragCoord / iResolution.xy;  // [0,1] coords
    
    // Your effects here
    
    gl_FragColor = vec4(color, 1.0);  // Output color
}
```

## Performance Checklist

- ✅ Pause completely during fullscreen apps
- ✅ Use GLSL shaders for ultra-low CPU usage
- ✅ Monitor detection runs only at startup
- ✅ Fullscreen detection runs every 500ms (low overhead)
- ✅ Render loop only runs when not paused
- ✅ Memory pooling for textures

## Common Win32 API Patterns

### Find Window by Class Name
```rust
let progman = FindWindowA(
    windows::Win32::Foundation::s!("Progman"),
    None
);
```

### Send Message to Window
```rust
SendMessageA(
    hwnd,
    WM_SPAWN_WORKER,  // 0x052C
    WPARAM(0),
    LPARAM(0)
);
```

### Enumerate All Windows
```rust
unsafe extern "system" fn callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
    // Process hwnd
    BOOL(1)  // Continue, or BOOL(0) to stop
}

EnumWindows(Some(callback), LPARAM(user_data));
```

### Get Window Dimensions
```rust
let mut rect = RECT::default();
GetWindowRect(hwnd, &mut rect);

let width = rect.right - rect.left;
let height = rect.bottom - rect.top;
```

### Get Display Resolution
```rust
let dc = GetDC(None);
let width = GetDeviceCaps(dc, HORZRES);   // Horizontal
let height = GetDeviceCaps(dc, VERTRES);  // Vertical
ReleaseDC(None, dc);
```

## Environment Setup

### Rust Toolchain
```powershell
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add to PATH
$env:Path += ";C:\Users\$env:USERNAME\.cargo\bin"

# Verify
rustc --version
cargo --version
```

### Node.js
```powershell
# Download from nodejs.org or use winget
winget install Node.js

# Verify
node --version
npm --version
```

### Tauri CLI
```bash
npm install -g @tauri-apps/cli
```

## Debugging

### Enable Logging
```rust
// In main.rs
env_logger::init();
```

### Dev Tools
In development mode, press: `Ctrl+Shift+I` to open DevTools

### Console Output
```rust
println!("Debug message");    // stdout
eprintln!("Error message");   // stderr
```

```typescript
console.log("Message");
console.error("Error");
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| WorkerW injection fails | Restart app, check Windows version |
| No monitors detected | Check display settings, restart |
| High CPU usage | Use shaders instead of videos, reduce quality |
| React hot-reload fails | Clear cache: `npm run build` |
| Build errors | `cargo clean && cargo build` |
| HWND not found | Window may be hidden, add visibility check |

## Performance Targets

| Metric | Target |
|--------|--------|
| Idle CPU | <0.5% |
| Playback CPU | 2-5% |
| GPU Usage | 10-30% |
| Memory | ~50MB |
| Startup | <2 sec |
| Pause Response | <50ms |

## Resources

- [Tauri Documentation](https://tauri.app)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Windows-rs Docs](https://microsoft.github.io/windows-rs/)
- [React Docs](https://react.dev)
- [GLSL Reference](https://www.khronos.org/opengl/)

## Example: Adding a New Monitor

```rust
// In monitor_detection.rs
pub unsafe fn enumerate_monitors() -> Vec<MonitorInfo> {
    let mut monitors = Vec::new();
    
    // Get primary
    let dc = GetDC(None);
    let width = GetDeviceCaps(dc, HORZRES);
    let height = GetDeviceCaps(dc, VERTRES);
    ReleaseDC(None, dc);
    
    monitors.push(MonitorInfo {
        index: 0,
        name: "Display 1".to_string(),
        width,
        height,
        x: 0,
        y: 0,
        is_primary: true,
    });
    
    // TODO: Add secondary monitors using EnumDisplayMonitors
    
    monitors
}
```

---

**Wall Aura** - High-Performance Live Wallpaper for Windows
Visit the [README.md](README.md) for full documentation.
