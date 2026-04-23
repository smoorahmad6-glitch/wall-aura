import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import Dashboard from './components/Dashboard';
import MonitorSelector from './components/MonitorSelector';
import ContentManager from './components/ContentManager';
import ShaderEditor from './components/ShaderEditor';
import './App.css';

interface Monitor {
  index: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  is_primary: boolean;
}

type TabType = 'dashboard' | 'monitors' | 'content' | 'shader';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize wallpaper layer
        await invoke('init_wallpaper');

        // Get monitors
        const monitorList: Monitor[] = await invoke('get_monitors');
        setMonitors(monitorList);

        // Get initial pause state
        const paused: boolean = await invoke('get_pause_state');
        setIsPaused(paused);

        // Listen for fullscreen events
        const unlistener = await listen('fullscreen_detected', (event) => {
          setIsFullscreen(event.payload as boolean);
        });

        setLoading(false);
        return () => unlistener();
      } catch (error) {
        console.error('Failed to initialize:', error);
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleTogglePause = async () => {
    try {
      await invoke('toggle_pause', { paused: !isPaused });
      setIsPaused(!isPaused);
    } catch (error) {
      console.error('Failed to toggle pause:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Initializing Wall Aura...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Wall Aura</h1>
              <p className="text-slate-400 text-sm mt-1">Live Wallpaper Engine for Windows</p>
            </div>
            <div className="flex items-center gap-4">
              {isFullscreen && (
                <span className="px-3 py-1 bg-red-900/50 border border-red-700 rounded-full text-red-300 text-sm">
                  Fullscreen Detected
                </span>
              )}
              <button
                onClick={handleTogglePause}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isPaused
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isPaused ? 'Paused' : 'Running'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {(['dashboard', 'monitors', 'content', 'shader'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab === 'shader' ? 'Shader Editor' : tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard monitors={monitors} isPaused={isPaused} isFullscreen={isFullscreen} />
        )}
        {activeTab === 'monitors' && <MonitorSelector monitors={monitors} />}
        {activeTab === 'content' && <ContentManager monitors={monitors} />}
        {activeTab === 'shader' && <ShaderEditor />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/20 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>Wall Aura v0.1.0 | High-Performance Live Wallpaper Engine</p>
        </div>
      </footer>
    </div>
  );
}
