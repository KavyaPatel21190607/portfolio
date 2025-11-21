// ===== VERTEX SHADER FOR ADVANCED 3D EFFECTS =====

attribute float size;
attribute vec3 customColor;
attribute float opacity;
attribute float time;

uniform float globalTime;
uniform float pixelRatio;
uniform vec3 mousePosition;
uniform float mouseInfluence;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vColor;
varying float vOpacity;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vSize;

// Noise function for procedural animation
float noise(vec3 position) {
    return fract(sin(dot(position, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

// Smooth noise
float smoothNoise(vec3 position) {
    vec3 i = floor(position);
    vec3 f = fract(position);
    
    f = f * f * (3.0 - 2.0 * f); // Smooth curve
    
    float a = noise(i);
    float b = noise(i + vec3(1.0, 0.0, 0.0));
    float c = noise(i + vec3(0.0, 1.0, 0.0));
    float d = noise(i + vec3(1.0, 1.0, 0.0));
    float e = noise(i + vec3(0.0, 0.0, 1.0));
    float f2 = noise(i + vec3(1.0, 0.0, 1.0));
    float g = noise(i + vec3(0.0, 1.0, 1.0));
    float h = noise(i + vec3(1.0, 1.0, 1.0));
    
    float x1 = mix(a, b, f.x);
    float x2 = mix(c, d, f.x);
    float x3 = mix(e, f2, f.x);
    float x4 = mix(g, h, f.x);
    
    float y1 = mix(x1, x2, f.y);
    float y2 = mix(x3, x4, f.y);
    
    return mix(y1, y2, f.z);
}

// Fractal noise
float fractalNoise(vec3 position) {
    float total = 0.0;
    float frequency = 1.0;
    float amplitude = 1.0;
    float maxValue = 0.0;
    
    for(int i = 0; i < 4; i++) {
        total += smoothNoise(position * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return total / maxValue;
}

// Wave distortion
vec3 waveDistortion(vec3 pos, float time) {
    float wave1 = sin(pos.x * 2.0 + time * 2.0) * 0.1;
    float wave2 = sin(pos.y * 1.5 + time * 1.5) * 0.1;
    float wave3 = sin(pos.z * 1.8 + time * 1.2) * 0.1;
    
    return vec3(wave1, wave2, wave3);
}

// Mouse interaction effect
vec3 mouseEffect(vec3 pos, vec3 mousePos, float influence) {
    vec3 direction = pos - mousePos;
    float distance = length(direction);
    
    if(distance < influence && distance > 0.0) {
        float force = (influence - distance) / influence;
        force = force * force; // Quadratic falloff
        return normalize(direction) * force * 0.5;
    }
    
    return vec3(0.0);
}

// Spiral effect
vec3 spiral(vec3 pos, float time, float intensity) {
    float angle = time + length(pos.xz) * 2.0;
    float spiral = sin(angle) * intensity;
    return vec3(
        cos(angle) * spiral,
        0.0,
        sin(angle) * spiral
    );
}

void main() {
    vColor = customColor;
    vOpacity = opacity;
    vUv = uv;
    vSize = size;
    
    // Start with original position
    vec3 pos = position;
    
    // Apply wave distortion
    vec3 waveOffset = waveDistortion(pos, globalTime);
    pos += waveOffset;
    
    // Apply fractal noise displacement
    float noiseOffset = fractalNoise(pos * 0.5 + globalTime * 0.1) * 0.3;
    pos += normal * noiseOffset;
    
    // Apply spiral effect for certain particles
    if(size > 5.0) {
        vec3 spiralOffset = spiral(pos, globalTime * 0.5, 0.2);
        pos += spiralOffset;
    }
    
    // Apply mouse interaction
    vec3 mouseOffset = mouseEffect(pos, mousePosition, mouseInfluence);
    pos += mouseOffset;
    
    // Floating animation
    float floatOffset = sin(globalTime * 1.5 + pos.x * 0.01) * 0.5;
    pos.y += floatOffset;
    
    // Rotation around Y-axis
    float rotationSpeed = 0.5 + fractalNoise(pos) * 0.3;
    float angle = globalTime * rotationSpeed;
    mat3 rotationMatrix = mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
    );
    pos = rotationMatrix * pos;
    
    // Calculate final position
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vPosition = mvPosition.xyz;
    
    // Calculate normal for lighting
    vNormal = normalize(normalMatrix * normal);
    
    // Point size calculation with distance attenuation
    float distance = length(mvPosition.xyz);
    gl_PointSize = size * pixelRatio * (300.0 / distance);
    
    // Ensure minimum and maximum sizes
    gl_PointSize = clamp(gl_PointSize, 1.0, 100.0);
    
    // Apply size variation based on time
    float sizeVariation = 1.0 + sin(globalTime * 2.0 + pos.x * 0.1) * 0.2;
    gl_PointSize *= sizeVariation;
    
    // Final position
    gl_Position = projectionMatrix * mvPosition;
    
    // Add depth-based fade
    float depthFade = 1.0 - smoothstep(50.0, 100.0, distance);
    vOpacity *= depthFade;
}
