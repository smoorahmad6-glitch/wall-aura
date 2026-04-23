import React, { useState } from 'react';

export default function ShaderEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState('perlin');
  const [customCode, setCustomCode] = useState(perlinNoiseShader);

  const templates = {
    perlin: perlinNoiseShader,
    plasma: plasmaShader,
    waves: wavesShader,
    particles: particleShader,
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">GLSL Shader Templates</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(templates).map(([key, _]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedTemplate(key);
                setCustomCode(templates[key as keyof typeof templates]);
              }}
              className={`p-3 rounded font-semibold capitalize transition ${
                selectedTemplate === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Shader Code</h3>
        <textarea
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-600 rounded font-mono text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          spellCheck="false"
        />
      </div>

      {/* Preview & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Live Preview</h3>
          <canvas
            id="shader-preview"
            className="w-full aspect-video bg-slate-900 rounded border border-slate-600"
          />
        </div>

        {/* Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Parameters</h3>

          <div>
            <label className="block text-white font-semibold mb-2">Intensity</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Speed</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Color Palette</label>
            <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500">
              <option>Default</option>
              <option>Warm</option>
              <option>Cool</option>
              <option>Pastel</option>
              <option>Neon</option>
            </select>
          </div>

          <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition">
            Apply Shader
          </button>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">📖 Shader Documentation</h3>
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            <strong className="text-white">Built-in variables:</strong>
          </p>
          <ul className="ml-4 space-y-1 font-mono text-xs">
            <li>• <code className="text-blue-400">gl_FragCoord</code> - Fragment coordinates</li>
            <li>• <code className="text-blue-400">iTime</code> - Elapsed time in seconds</li>
            <li>• <code className="text-blue-400">iResolution</code> - Screen resolution</li>
            <li>• <code className="text-blue-400">iMouse</code> - Mouse position (if enabled)</li>
          </ul>
          <p className="mt-3">
            <strong className="text-white">Performance:</strong> GLSL shaders run entirely on GPU with zero disk space overhead.
          </p>
        </div>
      </div>
    </div>
  );
}

const perlinNoiseShader = `#version 430
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
in vec2 fragCoord;
out vec4 fragColor;

// Simplex noise implementation
float noise(vec3 p) {
    return sin(p.x * 12.9898 + p.y * 78.233 + p.z * 45.164) * 43758.5453;
}

void main() {
    vec2 uv = fragCoord / iResolution.xy;
    
    float n = noise(vec3(uv * 3.0, iTime * 0.5));
    
    vec3 col = vec3(n * 0.5 + 0.5);
    
    fragColor = vec4(col, 1.0);
}`;

const plasmaShader = `#version 430
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
in vec2 fragCoord;
out vec4 fragColor;

void main() {
    vec2 uv = fragCoord / iResolution.xy;
    
    float str = sin(uv.x * 10.0 + iTime) + sin(uv.y * 10.0 + iTime * 0.7);
    float val = sin(str * 3.0) * 0.5 + 0.5;
    
    vec3 col = vec3(
        sin(val + iTime) * 0.5 + 0.5,
        sin(val + iTime * 1.3 + 2.0) * 0.5 + 0.5,
        sin(val + iTime * 0.7 + 4.0) * 0.5 + 0.5
    );
    
    fragColor = vec4(col, 1.0);
}`;

const wavesShader = `#version 430
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
in vec2 fragCoord;
out vec4 fragColor;

void main() {
    vec2 uv = fragCoord / iResolution.xy;
    
    float wave1 = sin(uv.x * 5.0 - iTime + sin(uv.y * 3.0)) * 0.5 + 0.5;
    float wave2 = cos(uv.y * 5.0 - iTime * 0.8 + cos(uv.x * 3.0)) * 0.5 + 0.5;
    
    vec3 col = vec3(wave1, wave2, (wave1 + wave2) * 0.5);
    
    fragColor = vec4(col, 1.0);
}`;

const particleShader = `#version 430
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
in vec2 fragCoord;
out vec4 fragColor;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = fragCoord / iResolution.xy;
    
    float particles = 0.0;
    for(int i = 0; i < 5; i++) {
        vec2 p = vec2(sin(iTime * 0.1 + float(i)) * 0.5 + 0.5,
                       cos(iTime * 0.1 + float(i)) * 0.5 + 0.5);
        
        float d = distance(uv, p);
        particles += 0.01 / (d + 0.1);
    }
    
    vec3 col = vec3(particles, particles * 0.7, 1.0 - particles * 0.5);
    
    fragColor = vec4(col, 1.0);
}`;
