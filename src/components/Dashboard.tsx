import React from 'react';

interface Monitor {
  index: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  is_primary: boolean;
}

interface DashboardProps {
  monitors: Monitor[];
  isPaused: boolean;
  isFullscreen: boolean;
}

export default function Dashboard({ monitors, isPaused, isFullscreen }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-semibold mb-2">Status</h3>
          <p className="text-2xl font-bold text-white">
            {isPaused ? '⏸️ Paused' : '▶️ Running'}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-semibold mb-2">Connected Monitors</h3>
          <p className="text-2xl font-bold text-blue-400">{monitors.length}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-semibold mb-2">Fullscreen</h3>
          <p className={`text-2xl font-bold ${isFullscreen ? 'text-red-400' : 'text-green-400'}`}>
            {isFullscreen ? 'Detected' : 'No'}
          </p>
        </div>
      </div>

      {/* Monitors Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Monitor Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitors.map((monitor) => (
            <div key={monitor.index} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{monitor.name}</h3>
                  <p className="text-slate-400 text-sm">
                    {monitor.is_primary ? '(Primary)' : ''}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-900/50 border border-blue-700 rounded text-blue-300 text-xs font-semibold">
                  Monitor {monitor.index}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution:</span>
                  <span className="text-white font-semibold">
                    {monitor.width} × {monitor.height}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Position:</span>
                  <span className="text-white font-semibold">
                    ({monitor.x}, {monitor.y})
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition">
                  Configure Wallpaper
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">💡 Quick Tips</h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li>• Use GLSL shaders for ultra-lightweight procedural backgrounds</li>
          <li>• The wallpaper automatically pauses during fullscreen applications</li>
          <li>• Configure different content for each monitor independently</li>
          <li>• Span a single wallpaper across all monitors with proper alignment</li>
          <li>• Monitor CPU and GPU usage in real-time</li>
        </ul>
      </div>
    </div>
  );
}
