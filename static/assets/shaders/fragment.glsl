// ===== FRAGMENT SHADER FOR ADVANCED 3D EFFECTS =====

precision mediump float;

uniform float globalTime;
uniform vec3 mousePosition;
uniform float mouseInfluence;
uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform float lightIntensity;
uniform vec2 resolution;

varying vec3 vColor;
varying float vOpacity;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vSize;

// Noise function
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Smooth noise
float smoothNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractal Brownian Motion
float fbm(vec2 st, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 8; i++) {
        if(i >= octaves) break;
        value += amplitude * smoothNoise(st * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

// Circular particle shape
float circle(vec2 center, float radius) {
    return 1.0 - smoothstep(radius - 0.1, radius, length(center));
}

// Soft circular particle
float softCircle(vec2 center, float radius, float softness) {
    float distance = length(center);
    return 1.0 - smoothstep(radius - softness, radius, distance);
}

// Star shape
float star(vec2 st, int points, float size) {
    st = st * 2.0 - 1.0;
    float angle = atan(st.x, st.y);
    float radius = length(st);
    
    float slice = 6.28318530718 / float(points);
    float currentSlice = mod(angle + slice * 0.5, slice) - slice * 0.5;
    float starRadius = size * cos(currentSlice * float(points) * 0.5);
    
    return 1.0 - smoothstep(starRadius - 0.1, starRadius, radius);
}

// Hex shape
float hex(vec2 st, float size) {
    st = abs(st);
    return max((st.x * 0.866025 + st.y * 0.5), st.y) - size;
}

// Glow effect
float glow(vec2 center, float radius, float intensity) {
    float distance = length(center);
    return intensity / (1.0 + distance * distance / (radius * radius));
}

// Plasma effect
vec3 plasma(vec2 st, float time) {
    float x = st.x;
    float y = st.y;
    
    float v1 = sin(x * 10.0 + time);
    float v2 = sin(10.0 * (x * sin(time / 2.0) + y * cos(time / 3.0)) + time);
    float v3 = sin(sqrt(100.0 * (x * x + y * y) + 1.0) + time);
    
    float finalValue = v1 + v2 + v3;
    
    vec3 color1 = vec3(1.0, 0.5, 0.5);
    vec3 color2 = vec3(0.5, 1.0, 0.5);
    vec3 color3 = vec3(0.5, 0.5, 1.0);
    
    return color1 * sin(finalValue * 3.14159) +
           color2 * sin(finalValue * 3.14159 + 2.0) +
           color3 * sin(finalValue * 3.14159 + 4.0);
}

// Energy field effect
float energyField(vec2 st, float time) {
    float field = 0.0;
    
    for(int i = 0; i < 3; i++) {
        float fi = float(i);
        vec2 offset = vec2(
            sin(time * (0.5 + fi * 0.3)) * 0.3,
            cos(time * (0.7 + fi * 0.2)) * 0.3
        );
        
        float distance = length(st - offset);
        field += 1.0 / (1.0 + distance * distance * 10.0);
    }
    
    return field;
}

// Lightning effect
float lightning(vec2 st, float time) {
    float lightning = 0.0;
    
    // Create branching lightning pattern
    for(int i = 0; i < 5; i++) {
        float fi = float(i);
        float branch = sin(st.x * (5.0 + fi) + time * 10.0) * 0.1;
        float distance = abs(st.y - branch);
        lightning += 1.0 / (1.0 + distance * 50.0);
    }
    
    return lightning * smoothstep(0.2, 0.8, noise(st * 10.0 + time));
}

// Holographic effect
vec3 holographic(vec2 st, vec3 baseColor, float time) {
    float scan = sin(st.y * 800.0 - time * 10.0) * 0.04;
    float flicker = noise(vec2(time * 100.0)) * 0.1;
    
    vec3 color = baseColor + scan + flicker;
    
    // Add RGB separation
    color.r += sin(st.y * 300.0) * 0.02;
    color.g += sin(st.y * 300.0 + 2.0) * 0.02;
    color.b += sin(st.y * 300.0 + 4.0) * 0.02;
    
    return color;
}

void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    vec2 st = gl_PointCoord;
    
    // Base shape - soft circle
    float shape = softCircle(center, 0.5, 0.2);
    
    // Add noise for organic feel
    float noiseValue = fbm(st * 8.0 + globalTime * 0.5, 4);
    shape *= (0.8 + noiseValue * 0.4);
    
    // Energy field effect
    float energy = energyField(center, globalTime);
    
    // Color calculation
    vec3 finalColor = vColor;
    
    // Apply holographic effect
    finalColor = holographic(st, finalColor, globalTime);
    
    // Add energy glow
    finalColor += energy * vec3(0.2, 0.5, 1.0);
    
    // Lighting calculation
    vec3 normal = normalize(vNormal);
    float lightDot = dot(normal, normalize(lightDirection));
    float lighting = max(0.0, lightDot) * lightIntensity;
    finalColor *= (0.3 + lighting * 0.7);
    
    // Mouse interaction glow
    float mouseDistance = length(vPosition.xy - mousePosition.xy);
    if(mouseDistance < mouseInfluence) {
        float mouseFactor = (mouseInfluence - mouseDistance) / mouseInfluence;
        mouseFactor = mouseFactor * mouseFactor; // Quadratic falloff
        finalColor += vec3(1.0, 1.0, 1.0) * mouseFactor * 0.3;
        shape += mouseFactor * 0.2;
    }
    
    // Pulsing animation
    float pulse = sin(globalTime * 3.0 + vPosition.x * 0.1) * 0.5 + 0.5;
    finalColor *= (0.7 + pulse * 0.3);
    
    // Edge glow
    float edgeGlow = glow(center, 0.3, 0.5);
    finalColor += edgeGlow * vec3(0.1, 0.3, 0.5);
    
    // Final alpha calculation
    float alpha = shape * vOpacity;
    
    // Add transparency variation
    alpha *= (0.6 + sin(globalTime * 2.0 + vPosition.z * 0.1) * 0.4);
    
    // Depth fade
    float depthFade = 1.0 - smoothstep(50.0, 100.0, length(vPosition));
    alpha *= depthFade;
    
    // Discard if too transparent
    if(alpha < 0.01) discard;
    
    // Apply gamma correction
    finalColor = pow(finalColor, vec3(1.0 / 2.2));
    
    // Final color output
    gl_FragColor = vec4(finalColor, alpha);
}
