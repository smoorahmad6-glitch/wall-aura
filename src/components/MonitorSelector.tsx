import React, { useState } from 'react';

interface Monitor {
  index: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  is_primary: boolean;
}

interface MonitorSelectorProps {
  monitors: Monitor[];
}

export default function MonitorSelector({ monitors }: MonitorSelectorProps) {
  const [selectedMonitor, setSelectedMonitor] = useState(0);
  const [spanMode, setSpanMode] = useState(false);

  // Calculate total span dimensions
  const minX = Math.min(...monitors.map(m => m.x));
  const minY = Math.min(...monitors.map(m => m.y));
  const maxX = Math.max(...monitors.map(m => m.x + m.width));
  const maxY = Math.max(...monitors.map(m => m.y + m.height));

  const totalWidth = maxX - minX;
  const totalHeight = maxY - minY;

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Display Mode</h2>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={!spanMode}
              onChange={() => setSpanMode(false)}
              className="w-4 h-4"
            />
            <span className="ml-3 text-white font-semibold">Per-Monitor Wallpapers</span>
          </label>
          <p className="ml-7 text-slate-400 text-sm">Set different wallpaper content for each display</p>

          <label className="flex items-center cursor-pointer mt-4">
            <input
              type="radio"
              checked={spanMode}
              onChange={() => setSpanMode(true)}
              className="w-4 h-4"
            />
            <span className="ml-3 text-white font-semibold">Span Across All Monitors</span>
          </label>
          <p className="ml-7 text-slate-400 text-sm">
            Display one wallpaper across all {monitors.length} display{monitors.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {!spanMode ? (
        /* Per-Monitor Configuration */
        <div className="space-y-6">
          {/* Monitor Selector Tabs */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {monitors.map((monitor) => (
                <button
                  key={monitor.index}
                  onClick={() => setSelectedMonitor(monitor.index)}
                  className={`p-4 border-r border-b border-slate-700 transition ${
                    selectedMonitor === monitor.index
                      ? 'bg-blue-900 border-blue-600'
                      : 'bg-slate-750 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-left">
                    <h3 className={`font-semibold ${
                      selectedMonitor === monitor.index ? 'text-blue-300' : 'text-white'
                    }`}>
                      {monitor.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {monitor.width}×{monitor.height}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Monitor Details */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {monitors[selectedMonitor]?.name} - Configuration
              </h3>

              {/* Monitor Preview */}
              <div className="mb-6">
                <div className="aspect-video bg-slate-900 border-2 border-slate-600 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🖥️</div>
                    <p className="text-slate-400 font-semibold">
                      {monitors[selectedMonitor]?.width}×{monitors[selectedMonitor]?.height}
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuration Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Content Type</label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500">
                    <option>Video File</option>
                    <option>Image</option>
                    <option>GLSL Shader</option>
                    <option>HTML5 Canvas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">File Path</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Select a file..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition">
                      Browse
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition">
              Save Configuration
            </button>
          </div>
        </div>
      ) : (
        /* Span Mode Configuration */
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Multi-Monitor Configuration</h3>

            {/* Virtual Screen Preview */}
            <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-600">
              <p className="text-slate-400 text-sm mb-3">Total Virtual Screen Size</p>
              <div className="flex items-end justify-center gap-8">
                <div>
                  <div className="text-3xl font-bold text-blue-400">{totalWidth}</div>
                  <p className="text-slate-400 text-xs mt-1">pixels width</p>
                </div>
                <div className="text-slate-500 text-xl">×</div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">{totalHeight}</div>
                  <p className="text-slate-400 text-xs mt-1">pixels height</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-slate-750 rounded p-4 mb-6 text-sm">
              <p className="text-slate-300 mb-2">
                <strong>Monitors:</strong> {monitors.length}
              </p>
              <p className="text-slate-300 mb-2">
                <strong>Primary Monitor:</strong> {monitors.find(m => m.is_primary)?.name || 'N/A'}
              </p>
              <p className="text-slate-400 text-xs mt-3">
                The wallpaper will be stretched/scaled to fit all monitors seamlessly.
              </p>
            </div>

            {/* Configuration Options */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white font-semibold mb-2">Content Type</label>
                <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500">
                  <option>Video File</option>
                  <option>Image</option>
                  <option>GLSL Shader</option>
                  <option>HTML5 Canvas</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">File Path</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Select a file..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition">
                    Browse
                  </button>
                </div>
              </div>

              <label className="flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="ml-3 text-white font-semibold">Maintain Aspect Ratio</span>
              </label>
            </div>

            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition">
              Apply Across All Monitors
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
