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

interface ContentManagerProps {
  monitors: Monitor[];
}

export default function ContentManager({ monitors }: ContentManagerProps) {
  const [selectedFormat, setSelectedFormat] = useState('video');
  const [selectedMonitor, setSelectedMonitor] = useState(0);

  const videoFormats = ['MP4', 'WebM', 'AVI', 'MKV'];
  const imageFormats = ['PNG', 'JPG', 'BMP', 'GIF'];

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-xl font-bold text-white mb-6">Upload Wallpaper Content</h2>

        {/* Format Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          {['video', 'image', 'shader'].map((format) => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`pb-3 px-4 font-semibold capitalize transition border-b-2 ${
                selectedFormat === format
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {format === 'shader' ? 'GLSL Shader' : format}
            </button>
          ))}
        </div>

        {/* Upload Zone for Videos */}
        {selectedFormat === 'video' && (
          <div>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center mb-6 hover:border-blue-500 transition cursor-pointer">
              <div className="text-4xl mb-3">🎬</div>
              <p className="text-white font-semibold mb-1">Drop video files here</p>
              <p className="text-slate-400 text-sm mb-4">
                Supported: {videoFormats.join(', ')}
              </p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold">
                Browse Files
              </button>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Apply to Monitor</h3>
              <select
                value={selectedMonitor}
                onChange={(e) => setSelectedMonitor(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              >
                {monitors.map((monitor) => (
                  <option key={monitor.index} value={monitor.index}>
                    {monitor.name} ({monitor.width}×{monitor.height})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Upload Zone for Images */}
        {selectedFormat === 'image' && (
          <div>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center mb-6 hover:border-blue-500 transition cursor-pointer">
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-white font-semibold mb-1">Drop image files here</p>
              <p className="text-slate-400 text-sm mb-4">
                Supported: {imageFormats.join(', ')}
              </p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold">
                Browse Files
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Scaling Mode</label>
                <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500">
                  <option>Fit (Letterbox)</option>
                  <option>Fill (Crop)</option>
                  <option>Stretch</option>
                  <option>Tile</option>
                </select>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Apply to Monitor</h3>
                <select
                  value={selectedMonitor}
                  onChange={(e) => setSelectedMonitor(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {monitors.map((monitor) => (
                    <option key={monitor.index} value={monitor.index}>
                      {monitor.name} ({monitor.width}×{monitor.height})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Shader Selection */}
        {selectedFormat === 'shader' && (
          <div>
            <div className="bg-slate-900 rounded-lg p-6 mb-6 border border-slate-600">
              <p className="text-slate-300 text-sm mb-4">
                Choose from pre-built procedurally generated shader effects:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Perlin Noise', 'Plasma Waves', 'Particle System', 'Fractal'].map((shader) => (
                  <button
                    key={shader}
                    className="p-3 bg-slate-800 border border-slate-600 hover:border-blue-500 rounded text-white font-semibold transition text-left"
                  >
                    {shader}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Apply to Monitor</h3>
              <select
                value={selectedMonitor}
                onChange={(e) => setSelectedMonitor(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              >
                {monitors.map((monitor) => (
                  <option key={monitor.index} value={monitor.index}>
                    {monitor.name} ({monitor.width}×{monitor.height})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">⚡ Performance Tips</h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li>• Use GLSL Shaders for minimal resource usage (near-zero disk space)</li>
          <li>• Video files: H.265 codec offers 40% better compression than H.264</li>
          <li>• Recommended video bitrate: 5-15 Mbps for 1080p, 10-25 Mbps for 4K</li>
          <li>• Shaders run entirely on GPU, leaving CPU virtually idle</li>
          <li>• Disable complex effects on lower-end systems</li>
        </ul>
      </div>
    </div>
  );
}
