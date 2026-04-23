# Wall Aura - Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER COMPUTER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐         ┌──────────────────────┐  │
│  │   React Frontend         │         │   Tauri Framework    │  │
│  │   (UI Dashboard)         │◄────────►│   (Bridge Layer)     │  │
│  │                          │         │                      │  │
│  │ • Dashboard              │         │ • Command Handlers   │  │
│  │ • Monitor Selector       │         │ • Event System       │  │
│  │ • Content Manager        │         │ • Window Management  │  │
│  │ • Shader Editor          │         │                      │  │
│  └──────────────────────────┘         └──────────┬───────────┘  │
│                                                   │                │
│                                    ┌──────────────▼─────────────┐ │
│                                    │   Rust Backend (lib.rs)    │ │
│                                    │                            │ │
│                                    │ • Wallpaper Injection      │ │
│                                    │ • Fullscreen Detection     │ │
│                                    │ • Monitor Enumeration      │ │
│                                    │ • Shader Compilation       │ │
│                                    └──────────────┬─────────────┘ │
│                                                   │                │
│                    ┌──────────────────────────────┼────────┐      │
│                    │                              │        │      │
│        ┌───────────▼────────┐      ┌─────────────▼──┐  ┌──▼────┐│
│        │  Win32 API Layer   │      │  Display Layer │  │ System ││
│        │  (windows-rs)      │      │                │  │ Events ││
│        │                    │      │ • WorkerW      │  │        ││
│        │ • FindWindowA      │      │ • Desktop      │  │ • Mouse││
│        │ • SendMessageA     │      │ • Icons        │  │ • Focus││
│        │ • EnumWindows      │      │ • Monitors     │  │ • Key  ││
│        │ • SetParent        │      │                │  │        ││
│        │ • GetForegroundWnd │      └────────────────┘  └────────┘│
│        │ • GetWindowRect    │                                     │
│        │ • GetDeviceCaps    │                                     │
│        └────────────────────┘                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Wallpaper Injection

```
                        INITIALIZATION
                              │
                ┌─────────────▼──────────────┐
                │  App.tsx starts            │
                │  invoke("init_wallpaper")  │
                └─────────────┬──────────────┘
                              │
           ┌──────────────────▼──────────────────┐
           │  main.rs receives command           │
           │  Begins WorkerW injection sequence  │
           └──────────────────┬──────────────────┘
                              │
        ┌─────────────────────▼─────────────────────┐
        │  lib.rs - wallpaper_injection module      │
        └─────────────────────┬─────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐        ┌──────────┐        ┌──────────────┐
    │ Step 1  │        │ Step 2   │        │ Step 3       │
    │         │        │          │        │              │
    │ Find    │──────► │ Send     │──────►│ Find         │
    │ Progman │        │ 0x052C   │       │ WorkerW      │
    │ Window  │        │ Message  │       │ Window       │
    │         │        │ to       │       │              │
    └─────────┘        │ Progman  │       └──────────────┘
                       │          │
                       │ (Creates │
                       │ WorkerW) │
                       │          │
                       └──────────┘
    
         ┌────────────────────────────────────────┐
         │                                        │
         │          ▼                             │
         │     ┌──────────────┐                   │
         │     │ Step 4       │                   │
         │     │              │                   │
         │     │ SetParent()  │                   │
         │     │ Attach our   │                   │
         │     │ window to    │                   │
         │     │ WorkerW      │                   │
         │     │              │                   │
         │     └──────────────┘                   │
         │            │                           │
         │            ▼                           │
         │     ┌──────────────────┐              │
         │     │ ✓ SUCCESS!       │              │
         │     │                  │              │
         │     │ Wallpaper now    │              │
         │     │ behind icons     │              │
         │     └──────────────────┘              │
         │                                        │
         └────────────────────────────────────────┘
```

## Data Flow: Fullscreen Detection

```
┌────────────────────────────────────────────────┐
│  main.rs spawns background task                │
│  Runs every 500 milliseconds                   │
└────────────────────────┬───────────────────────┘
                         │
                ┌────────▼────────┐
                │ Check Loop      │
                │ (500ms)         │
                └────────┬────────┘
                         │
         ┌───────────────▼───────────────┐
         │                               │
         │ GetForegroundWindow() ────────┤
         │ Get active window's HWND      │
         │                               │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼────────────────┐
         │                                │
         │ GetWindowRect()                │
         │ Get window dimensions          │
         │ width = rect.right - left      │
         │ height = rect.bottom - top     │
         │                                │
         └───────────────┬────────────────┘
                         │
         ┌───────────────▼───────────────┐
         │                               │
         │ GetDeviceCaps()               │
         │ Get screen resolution         │
         │ screen_width = HORZRES        │
         │ screen_height = VERTRES       │
         │                               │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │                               │
         │ Compare Dimensions            │
         │                               │
         └───┬─────────────────────────┬─┘
             │                         │
             ▼                         ▼
      ┌────────────────┐        ┌────────────────┐
      │ FULLSCREEN     │        │ WINDOWED MODE  │
      │ DETECTED       │        │                │
      │                │        │                │
      │ window_w ==    │        │ window_w <     │
      │ screen_w &&    │        │ screen_w or    │
      │ window_h ==    │        │ window_h <     │
      │ screen_h       │        │ screen_h       │
      │                │        │                │
      └────────┬───────┘        └────────┬───────┘
               │                         │
          ┌────▼────┐              ┌─────▼────┐
          │ PAUSE   │              │ RESUME   │
          │ Kill    │              │ Start    │
          │ Rendering              │ Rendering
          │ CPU/GPU→0%│              │ CPU/GPU │
          │          │              │ Normal  │
          └────┬───┐─┘              └────┬─┬──┘
               │   │                      │ │
               │   └──────────► LOOP ◄───┘ │
               │                    ▲      │
               └─── EMIT EVENTS ────┴──────┘
                   fullscreen_detected
                   true/false
                   
                   (React updates UI)
```

## State Machine: Wallpaper Manager

```
                      ┌─────────────────┐
                      │   INITIALIZED   │
                      │                 │
                      │ Ready to render │
                      └────────┬────────┘
                               │
                  ┌────────────┼────────────┐
                  │            │            │
                  │            │            │
      ┌───────────▼────┐      │      ┌─────▼──────────┐
      │  RENDERING     │      │      │  PAUSED        │
      │                │      │      │                │
      │ CPU: 2-5%      │◄─────┼─────►│ CPU: <0.5%     │
      │ GPU: 10-30%    │      │      │ GPU: 0%        │
      │                │      │      │                │
      └────────┬───────┘      │      └────────┬───────┘
               │              │               │
               │         ┌────▼────┐          │
               │         │Fullscreen          │
               │         │App Active          │
               │         └────┬────┘          │
               │              │              │
        ┌──────┴──────┐       │       ┌──────┴──────┐
        │             │       │       │             │
    User Toggles  Auto-Pause Auto-Resume   User Toggle
    Pause Button  (Detected) (Returned)      Resume
        │             │       │             │
        ▼             ▼       ▼             ▼
    
Events emitted: pause_state_changed
               fullscreen_detected
               
React updated with: isPaused, isFullscreen
```

## Monitor Configuration Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    MULTI-MONITOR SUPPORT                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  MODE SELECTION                                        │  │
│  │  ┌──────────────┐              ┌──────────────┐       │  │
│  │  │  Per-Monitor │              │ Span All     │       │  │
│  │  │              │              │              │       │  │
│  │  │ Different    │              │ Single image │       │  │
│  │  │ wallpaper    │              │ across all   │       │  │
│  │  │ per display  │              │ displays     │       │  │
│  │  └──────────────┘              └──────────────┘       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  MONITOR DETECTION                                           │
│    ↓                                                          │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Monitor 1         Monitor 2        Monitor 3         │    │
│  │ (Primary)         1920x1080        3840x2160 (UHD)   │    │
│  │ 1920x1080                                            │    │
│  │ Pos: (0,0)       Pos: (1920,0)    Pos: (3840,0)   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
├─ PER-MONITOR MODE ──────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Monitor 1  │  │  Monitor 2  │  │  Monitor 3  │         │
│  │             │  │             │  │             │         │
│  │  Video.mp4  │  │  Shader1    │  │  Image.png  │         │
│  │             │  │  (Plasma)   │  │             │         │
│  │ Config 1    │  │  Config 2   │  │ Config 3    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  Each stored in:  DashMap<usize, WallpaperConfig>           │
│                                                               │
├─ SPAN MODE ───────────────────────────────────────────────────┤
│                                                               │
│  Virtual Desktop Coordinate System                           │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │ Single wallpaper stretched across all monitors      │    │
│  │                                                      │    │
│  │ Total Virtual Screen:                               │    │
│  │ • Width = sum of all monitor widths                 │    │
│  │ • Height = max of all monitor heights               │    │
│  │ • Start position = min(all x coords)                │    │
│  │                                                      │    │
│  │ In this case:                                       │    │
│  │ • Virtual Width = 1920 + 1920 + 3840 = 7680 px    │    │
│  │ • Virtual Height = 2160 px (max)                    │    │
│  │ • Single config applied                             │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Content Pipeline

```
USER UPLOADS CONTENT
    │
    ├─────────────────┬────────────────┬──────────────┐
    │                 │                │              │
    ▼                 ▼                ▼              ▼
┌────────┐      ┌────────┐       ┌────────┐    ┌──────────┐
│ Video  │      │ Image  │       │ Shader │    │ Canvas   │
│ Files  │      │ Files  │       │ Code   │    │ HTML5    │
│        │      │        │       │        │    │ (Future) │
└───┬────┘      └───┬────┘       └───┬────┘    └────┬─────┘
    │                │               │              │
    │ MP4, WebM      │ PNG, JPG       │ GLSL        │ JavaScript
    │ AVI, MKV       │ BMP, GIF       │ Shaders     │ Canvas API
    │                │               │            │
    ▼                ▼               ▼            ▼
   ContentManager.tsx receives file
    │
    ▼
┌─────────────────────────────┐
│ User selects:               │
│ • Content type              │
│ • Target monitor(s)         │
│ • Mode (Per-monitor/Span)   │
│ • Additional settings       │
└─────────────┬───────────────┘
              │
              ▼
┌──────────────────────────────────┐
│ invoke['set_wallpaper_config']   │
│ (monitor_index, config)          │
└─────────────┬────────────────────┘
              │
              ▼
┌────────────────────────────────┐
│ Rust: main.rs command handler  │
│ WallpaperManager.add_config()   │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ Store in:                      │
│ DashMap<usize,WallpaperConfig> │
│ (Thread-safe concurrent map)   │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ Render loop checks config:     │
│ for each monitor               │
│   get_config(monitor_index)    │
│   load content                 │
│   render                       │
└──────────────┬─────────────────┘
               │
               ▼
         ✓ DISPLAYED
```

## Git Directory Structure

```
wall-aura/
│
├── 📄 README.md                 ← Start here
├── 📄 IMPLEMENTATION.md         ← Technical details
├── 📄 QUICK_REFERENCE.md        ← Cheat sheet
├── 📄 FULL_SUMMARY.md           ← This summary
├── 📄 Architecture diagrams     ← You are here
│
├── 🦀 Rust Backend
│   ├── Cargo.toml               ← Root Rust config
│   ├── build.rs                 ← Build script
│   └── src-tauri/
│       ├── Cargo.toml           ← Rust dependencies
│       ├── lib.rs               ⭐ CORE logic
│       ├── main.rs              ← Tauri entry
│       ├── windows_integration.rs
│       ├── shaders.rs
│       ├── commands.rs
│       ├── build.rs
│       └── tauri.conf.json      ← Tauri config
│
├── ⚛️ React Frontend
│   ├── package.json             ← Frontend deps
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx             ← React entry
│       ├── App.tsx              ← Main component
│       ├── App.css
│       ├── index.css
│       ├── package.json
│       ├── vite.config.ts
│       └── components/
│           ├── Dashboard.tsx
│           ├── MonitorSelector.tsx
│           ├── ContentManager.tsx
│           └── ShaderEditor.tsx
│
├── 🛠️ Build Config
│   ├── package.json             ← Root Node config
│   ├── index.html               ← HTML entry
│   └── .gitignore
│
└── 🚀 Scripts
    └── setup.ps1                ← Windows setup script
```

---

**Architecture designed for:**
- ✅ Maximum performance (minimal CPU/GPU usage)
- ✅ Reliability (automatic fullscreen detection & pause)
- ✅ Scalability (multi-monitor support)
- ✅ Extensibility (shader templates, content types)
