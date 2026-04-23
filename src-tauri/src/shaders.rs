/// Advanced shader rendering system for GLSL effects
/// Provides ultra-lightweight procedural wallpaper generation

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderConfig {
    pub name: String,
    pub shader_code: String,
    pub parameters: Vec<ShaderParameter>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderParameter {
    pub name: String,
    pub param_type: String, // "float", "int", "vec3", "vec4"
    pub default_value: f32,
    pub min: f32,
    pub max: f32,
}

/// Built-in shader templates for zero-disk-space backgrounds
pub mod shader_templates {
    use super::*;

    pub fn perlin_noise_template() -> ShaderConfig {
        ShaderConfig {
            name: "Perlin Noise".to_string(),
            shader_code: r#"
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_brightness;

// Perlin noise function
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    float n = mix(
        mix(fract(sin(dot(i + vec2(0.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453), 
            fract(sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453), u.x),
        mix(fract(sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453), 
            fract(sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453), u.x),
        u.y
    );
    return n;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv *= u_scale;
    uv += u_time * u_speed * 0.1;
    
    float n = noise(uv);
    n = n * 0.5 + 0.5;
    
    vec3 color = vec3(n * u_brightness);
    gl_FragColor = vec4(color, 1.0);
}
            "#.to_string(),
            parameters: vec![
                ShaderParameter {
                    name: "scale".to_string(),
                    param_type: "float".to_string(),
                    default_value: 1.0,
                    min: 0.1,
                    max: 5.0,
                },
                ShaderParameter {
                    name: "speed".to_string(),
                    param_type: "float".to_string(),
                    default_value: 0.5,
                    min: 0.0,
                    max: 2.0,
                },
                ShaderParameter {
                    name: "brightness".to_string(),
                    param_type: "float".to_string(),
                    default_value: 0.5,
                    min: 0.0,
                    max: 1.0,
                },
            ],
        }
    }

    pub fn plasma_template() -> ShaderConfig {
        ShaderConfig {
            name: "Plasma Waves".to_string(),
            shader_code: r#"
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_frequency;
uniform float u_speed;
uniform float u_saturation;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float x = sin(uv.x * u_frequency + u_time * u_speed) * 0.5 + 0.5;
    float y = cos(uv.y * u_frequency + u_time * u_speed * 0.7) * 0.5 + 0.5;
    float z = sin((uv.x + uv.y) * u_frequency + u_time * u_speed * 0.5) * 0.5 + 0.5;
    
    vec3 color = vec3(x, y, z);
    color = mix(vec3(length(color)), color, u_saturation / 2.0);
    
    gl_FragColor = vec4(color, 1.0);
}
            "#.to_string(),
            parameters: vec![
                ShaderParameter {
                    name: "frequency".to_string(),
                    param_type: "float".to_string(),
                    default_value: 1.0,
                    min: 0.5,
                    max: 3.0,
                },
                ShaderParameter {
                    name: "speed".to_string(),
                    param_type: "float".to_string(),
                    default_value: 0.7,
                    min: 0.0,
                    max: 2.0,
                },
                ShaderParameter {
                    name: "saturation".to_string(),
                    param_type: "float".to_string(),
                    default_value: 1.0,
                    min: 0.0,
                    max: 2.0,
                },
            ],
        }
    }

    pub fn waves_template() -> ShaderConfig {
        ShaderConfig {
            name: "Waves".to_string(),
            shader_code: r#"
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_speed;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float wave = sin(uv.x * u_frequency + u_time * u_speed) * u_amplitude;
    wave += sin(uv.y * u_frequency * 0.5 + u_time * u_speed * 0.8) * u_amplitude * 0.5;
    
    vec3 color = vec3(
        0.5 + 0.5 * sin(uv.x + u_time * u_speed),
        0.5 + 0.5 * cos(uv.y + u_time * u_speed * 0.7),
        0.5 + 0.5 * sin(wave + u_time * u_speed)
    );
    
    gl_FragColor = vec4(color, 1.0);
}
            "#.to_string(),
            parameters: vec![
                ShaderParameter {
                    name: "amplitude".to_string(),
                    param_type: "float".to_string(),
                    default_value: 0.5,
                    min: 0.0,
                    max: 1.0,
                },r#"
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_particle_count;
uniform float u_speed;
uniform float u_size;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);
    
    for (float i = 0.0; i < 20.0; i++) {
        if (i >= u_particle_count) break;
        
        vec2 particle_pos = vec2(
            fract(random(vec2(i, 0.0)) + u_time * u_speed * 0.1),
            fract(random(vec2(i, 1.0)) + u_time * u_speed * 0.15)
        );
        
        float dist = distance(uv, particle_pos);
        float circle = step(dist, u_size);
        
        color += circle * vec3(
            0.5 + 0.5 * sin(i + u_time),
            0.5 + 0.5 * cos(i * 0.7 + u_time),
            0.5 + 0.5 * sin(i * 1.3 + u_time * 0.8)
        );
    }
    
    gl_FragColor = vec4(color, 1.0);
}
            "#
                ShaderParameter {
                    name: "frequency".to_string(),
                    param_type: "float".to_string(),
                    default_value: 5.0,
                    min: 1.0,
                    max: 20.0,
                },
                ShaderParameter {
                    name: "speed".to_string(),
                    param_type: "float".to_string(),
                    default_value: 0.5,
                    min: 0.0,
                    max: 2.0,
                },
            ],
        }
    }

    pub fn particles_template() -> ShaderConfig {
        ShaderConfig {
            name: "Particles".to_string(),
            shader_code: include_str!("../shaders/particles.glsl").to_string(),
            parameters: vec![
                ShaderParameter {
                    name: "particle_count".to_string(),
                    param_type: "float".to_string(),
                    default_value: 5.0,
                    min: 1.0,
                    max: 20.0,
                },
                ShaderParameter {
                    name: "speed".to_string(),
                    param_type: "float".to_string(),
                    default_value: 0.5,
                    min: 0.0,
                    max: 2.0,
                },
                ShaderParameter {
                    name: "size".to_string(),
                    param_type: "float".to_string(),
                    default_value: 0.05,
                    min: 0.01,
                    max: 0.5,
                },
            ],
        }
    }

    pub fn all_templates() -> Vec<ShaderConfig> {
        vec![
            perlin_noise_template(),
            plasma_template(),
            waves_template(),
            particles_template(),
        ]
    }
}

/// Shader compilation and validation
pub mod shader_compiler {
    use super::*;

    pub fn validate_glsl(code: &str) -> Result<String, String> {
        // Basic validation - check for required main function
        if !code.contains("void main()") {
            return Err("GLSL code must contain a 'void main()' function".to_string());
        }

        // Check for required output
        if !code.contains("gl_FragColor") && !code.contains("FragColor") {
            return Err("GLSL code must output to 'gl_FragColor' or 'FragColor'".to_string());
        }

        Ok("GLSL validation passed".to_string())
    }

    pub fn compile_shader(code: &str) -> Result<Vec<u32>, String> {
        // In production, this would use actual GLSL compilation
        // For now, validate and return success
        validate_glsl(code)?;
        Ok(vec![0]) // Placeholder compiled shader
    }
}
