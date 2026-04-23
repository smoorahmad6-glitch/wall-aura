import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [wallpaper, setWallpaper] = useState("");

  const selectWallpaper = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }],
    });
    
    if (selected) {
      // تحويل المسار من نظام الويندوز لمسار بيفهمه المتصفح
      const url = convertFileSrc(selected);
      setWallpaper(url);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-cyan-400">
      {/* عرض الخلفية المختارة */}
      {wallpaper && (
        <img 
          src={wallpaper} 
          className="absolute inset-0 w-full h-full object-cover opacity-50 z-0" 
          alt="Wallpaper Preview"
        />
      )}

      {/* لوحة التحكم (Glassmorphism) */}
      <div className="z-10 glass-panel p-8 border border-cyan-500/30 bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.1)] text-center">
        <h1 className="text-4xl font-black mb-6 tracking-widest uppercase italic">
          AuraFlow <span className="text-fuchsia-500">v2</span>
        </h1>
        
        <p className="mb-8 text-cyan-200/70">Custom Desktop Engine by Ahmed</p>

        <button 
          onClick={selectWallpaper}
          className="px-8 py-3 border-2 border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-white transition-all duration-300 font-bold tracking-tighter"
        >
          SELECT NEON CORE
        </button>
      </div>
    </div>
  );
}

export default App;