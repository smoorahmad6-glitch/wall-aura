# Wall Aura - Implementation Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run tauri:dev
```

### 3. Production Build
```bash
npm run tauri:build
```

## Architecture Overview

### Backend (Rust)

**File Structure:**
```
src-tauri/
├── lib.rs                   # Core library with WorkerW injection
├── main.rs                  # Tauri command handlers
├── windows_integration.rs   # Win32 bindings
├── commands.rs              # Additional commands
├── shaders.rs              # Shader templates & compilation
└── Cargo.toml              # Dependencies
```

**Key Components:**

1. **lib.rs**: Core wallpaper management
   - `WallpaperManager`: State machine for pause/resume
   - `wallpaper_injection`: WorkerW layer injection
   - `monitor_detection`: Multi-display enumeration
   - `fullscreen_detection`: Window focus tracking

2. **main.rs**: Application entry point
   - Initializes Tauri app
   - Spawns fullscreen detection task (runs every 500ms)
   - Exposes 6 commands to React frontend

3. **windows_integration.rs**: Win32 API helpers
   - Gets HWND from Tauri window
   - Bridges between Tauri and Windows API

### Frontend (React + Tailwind)

**File Structure:**
```
src/
├── components/
│   ├── Dashboard.tsx         # Main overview
│   ├── MonitorSelector.tsx   # Display mode selection
│   ├── ContentManager.tsx    # Upload & file handling
│   └── ShaderEditor.tsx      # GLSL editor + live preview
├── App.tsx                   # Main component
├── main.tsx                  # React DOM entry
├── App.css                   # Custom animations
└── index.css                 # Global styles
```

**Key Features:**

1. **Dashboard**: 
   - Real-time status indicators
   - Monitor grid preview
   - Pause/Resume button

2. **Monitor Selector**:
   - Per-monitor vs span mode toggle
   - Individual configuration
   - Virtual screen size calculation

3. **Content Manager**:
   - Drag-drop file upload
   - Video, image, shader support
   - Performance tips

4. **Shader Editor**:
   - 4 pre-built templates
   - Custom code editor
   - Live parameter adjustment

## Critical: WorkerW Injection

### The Problem
Desktop icons must appear on top of the wallpaper. Normal windows are behind icons.

### The Solution
Use the undocumented message `0x052C` to make Windows create a special WorkerW layer:

```rust
// Step 1: Find Progman window
let progman = find_progman()?;  // "Progman" class window

// Step 2: Send magic message to spawn WorkerW
spawn_worker_w(progman);        // SendMessage with 0x052C

// Step 3: Find the newly created WorkerW
let worker_w = find_worker_w()?;  // Enumerate windows

// Step 4: Inject our window behind icons
inject_wall_into_worker(hwnd, worker_w);  // SetParent call
```

**Why 0x052C works:**
- Undocumented Windows API message
- Causes Progman to instantiate WorkerW at correct depth
- WorkerW is positioned exactly where wallpaper should be
- By parenting our window to WorkerW, we become the 'wallpaper layer'

### Testing WorkerW Injection
```rust
// In main.rs after Tauri launches
match unsafe { wallpaper_injection::init_wallpaper_layer(hwnd) } {
    Some(worker_w) => println!("Successfully injected!"),
    None => eprintln!("Injection failed"),
}
```

## Fullscreen Detection System

Monitors display state every 500ms:

```rust
loop {
    sleep(Duration::from_millis(500)).await;
    
    let is_fullscreen = unsafe { check_foreground_window_fullscreen() };
    
    if is_fullscreen && !paused {
        pause_rendering();  // ~0% CPU/GPU during pause
    }
}
```

**Detection Logic:**
```rust
// Get active window
let hwnd = GetForegroundWindow();

// Get its dimensions
let mut rect = RECT::default();
GetWindowRect(hwnd, &mut rect);

// Get screen dimensions
let screen_width = GetDeviceCaps(dc, HORZRES);
let screen_height = GetDeviceCaps(dc, VERTRES);

// Compare
if rect.width == screen_width && rect.height == screen_height {
    // Fullscreen detected!
}
```

## Multi-Monitor Support

### Enumeration
```rust
pub unsafe fn enumerate_monitors() -> Vec<MonitorInfo> {
    let mut monitors = Vec::new();
    
    // Get primary monitor info
    let dc = GetDC(None);
    let width = GetDeviceCaps(dc, HORZRES);
    let height = GetDeviceCaps(dc, VERTRES);
    
    monitors.push(MonitorInfo {
        index: 0,
        width,
        height,
        x: 0,
        y: 0,
        is_primary: true,
    });
    
    monitors
}
```

### Per-Monitor Mode
- Store separate `WallpaperConfig` for each monitor index
- Use `DashMap<usize, WallpaperConfig>` for concurrent access
- Each render loop uses appropriate config per display

### Span Mode
Calculate virtual desktop:
```rust
let min_x = monitors.iter().map(|m| m.x).min();
let max_x = monitors.iter().map(|m| m.x + m.width).max();
let total_width = max_x - min_x;
let total_height = max_y - min_y;
```

## Performance Targets

### Measurements
- **Idle**: <0.5% CPU, 0% GPU
- **Playback**: 2-5% CPU, 10-30% GPU
- **Fullscreen Apps**: ~0% (paused)
- **Memory**: ~50MB
- **Startup**: <2 seconds

### Optimization Techniques
1. **Event-Driven**: Only render on content change
2. **Smart Pause**: Complete pause during fullscreen
3. **GPU Acceleration**: Hardware-decoding for video
4. **Lazy Loading**: Load assets only when needed
5. **Shader Optimization**: Use lower-precision math on older GPUs

## GLSL Shader Implementation

### Shader Template Structure
```rust
pub struct ShaderConfig {
    pub name: String,
    pub shader_code: String,
    pub parameters: Vec<ShaderParameter>,
}

pub struct ShaderParameter {
    pub name: String,
    pub param_type: String,  // "float", "vec3", etc.
    pub default_value: f32,
    pub min: f32,
    pub max: f32,
}
```

### Example Shader
```glsl
#version 430
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float intensity;

void main() {
    vec2 uv = gl_FragCoord / iResolution.xy;
    
    float wave = sin(uv.x * 10.0 + iTime) * intensity;
    float col = wave * 0.5 + 0.5;
    
    gl_FragColor = vec4(vec3(col), 1.0);
}
```

### Built-in Uniforms
- `iTime`: Elapsed seconds (animated)
- `iResolution`: Screen dimensions (width, height, aspect)
- `iMouse`: Mouse position (if enabled)
- Custom parameters from UI sliders

## Tauri Command Flow

### React → Rust Communication

React component calls:
```typescript
import { invoke } from '@tauri-apps/api/tauri';

const result = await invoke('get_monitors');
```

Rust handles:
```rust
#[tauri::command]
async fn get_monitors() -> Result<Vec<MonitorInfo>, String> {
    unsafe {
        Ok(monitor_detection::enumerate_monitors())
    }
}
```

### Available Commands
1. `init_wallpaper()` - Initialize wallpaper layer
2. `get_monitors()` - Enumerate displays
3. `set_wallpaper_config(index, config)` - Configure monitor
4. `toggle_pause(paused)` - Pause/resume
5. `get_pause_state()` - Check pause status
6. `get_fullscreen_state()` - Check if fullscreen app active

### Event Flow
Rust → React:
```rust
// In Rust
app_handle.emit_all("fullscreen_detected", true);

// In React
await listen('fullscreen_detected', (event) => {
    setIsFullscreen(event.payload);
});
```

## Building & Deployment

### Development
```bash
npm run tauri:dev
```
- Runs Vite dev server on port 3000
- Hot-reload for React changes
- Full debugging capabilities

### Production
```bash
npm run tauri:build
```
Outputs:
- `target/release/wall-aura.exe` - Application executable
- `bundle/msi/` - Windows installer
- `bundle/nsis/` - NSIS installer

### Signing (Optional)
```bash
# For code signing on deployment
# Update tauri.conf.json with signing details
```

## Troubleshooting

### Compilation Errors

**"cannot find windows-rs"**
```bash
cargo update
cargo clean
cargo build
```

**TypeScript errors in React**
```bash
npm run type-check
```

### Runtime Issues

**"WorkerW injection failed"**
- Ensure running on Windows 10+
- Try restarting application
- Check for other wallpaper apps running

**"No monitors detected"**
- Verify displays are connected
- Check Windows display settings
- Restart application

**"High CPU during playback"**
- Use GLSL shaders for better performance
- Reduce video resolution
- Check fullscreen detection is working

## Advanced Customization

### Adding New Shader Template
1. Create `shaders/my_shader.glsl` with GLSL code
2. Add template function to `shaders.rs`:
   ```rust
   pub fn my_shader_template() -> ShaderConfig { ... }
   ```
3. Include in `all_templates()` list
4. Add UI button in `ShaderEditor.tsx`

### Custom Content Types
Modify `ContentType` enum in `lib.rs`:
```rust
pub enum ContentType {
    Video,
    Image,
    Shader,
    Canvas,
    CustomType,  // Add here
}
```

### Performance Profiling
Enable debug symbols:
```toml
# In Cargo.toml
[profile.release]
debug = true
```

Then use Windows Performance Analyzer or VTune.

## Windows API Reference

### Key Win32 Functions Used
- `FindWindowA()` - Locate window by class name
- `SendMessageA()` - Send message to window
- `EnumWindows()` - Iterate through windows
- `SetParent()` - Reparent window
- `GetForegroundWindow()` - Get active window
- `GetWindowRect()` - Get window dimensions
- `GetDeviceCaps()` - Query device capabilities

### Message Constants
- `WM_SPAWN_WORKER` = `0x052C` - Spawn WorkerW layer

## Resources

- [Tauri Docs](https://tauri.app/en/docs/)
- [Win32 API Reference](https://docs.microsoft.com/en-us/windows/win32/api/)
- [React Documentation](https://react.dev/)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
- [Tailwind CSS](https://tailwindcss.com/)

## License

MIT - Create and share freely!
