/**
 * GPU Optimizer for High-End Graphics Cards
 * Optimizes Three.js performance for RTX 4060 and similar GPUs
 */
class GPUOptimizer {
    constructor() {
        this.gpuTier = this.detectGPUTier();
        this.optimizedSettings = this.getOptimizedSettings();
    }

    detectGPUTier() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 'low';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Detect RTX 4060 and other high-end GPUs
        if (renderer.includes('RTX 40') || renderer.includes('RTX 30') || renderer.includes('RTX 20')) {
            return 'high';
        } else if (renderer.includes('GTX 16') || renderer.includes('GTX 10')) {
            return 'medium';
        }
        
        // Check WebGL capabilities
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        
        if (maxTextureSize >= 16384 && maxRenderBufferSize >= 16384) {
            return 'high';
        } else if (maxTextureSize >= 8192) {
            return 'medium';
        }
        
        return 'low';
    }

    getOptimizedSettings() {
        const settings = {
            low: {
                particleCount: 100,
                antialias: false,
                shadowMapSize: 512,
                pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                maxLights: 3,
                enablePostProcessing: false
            },
            medium: {
                particleCount: 300,
                antialias: true,
                shadowMapSize: 1024,
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                maxLights: 5,
                enablePostProcessing: false
            },
            high: {
                particleCount: 800,
                antialias: true,
                shadowMapSize: 2048,
                pixelRatio: Math.min(window.devicePixelRatio, 3),
                maxLights: 8,
                enablePostProcessing: true
            }
        };

        return settings[this.gpuTier];
    }

    optimizeRenderer(renderer) {
        // Enable GPU-specific optimizations
        renderer.setPixelRatio(this.optimizedSettings.pixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMap.autoUpdate = false; // Manual updates for performance
        
        // RTX-specific optimizations
        if (this.gpuTier === 'high') {
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;
            renderer.outputEncoding = THREE.sRGBEncoding;
            
            // Enable advanced features for high-end GPUs
            if (renderer.capabilities.isWebGL2) {
                renderer.capabilities.precision = 'highp';
            }
        }

        return renderer;
    }

    optimizeParticleSystem(particleSystem) {
        if (particleSystem && particleSystem.particleCount) {
            particleSystem.particleCount = this.optimizedSettings.particleCount;
            console.log(`GPU Tier: ${this.gpuTier.toUpperCase()} - Optimized particle count: ${this.optimizedSettings.particleCount}`);
        }
        return particleSystem;
    }

    enablePerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps >= 50) {
                    console.log(`Excellent performance: ${fps} FPS (GPU: ${this.gpuTier.toUpperCase()})`);
                } else if (fps >= 30) {
                    console.log(`Good performance: ${fps} FPS`);
                } else {
                    console.warn(`Low performance detected: ${fps} FPS`);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }

    static applyOptimizations() {
        const optimizer = new GPUOptimizer();
        
        // Store globally for access by other scripts
        window.gpuOptimizer = optimizer;
        
        console.log(`GPU Optimizer initialized - Tier: ${optimizer.gpuTier.toUpperCase()}`);
        console.log('Optimized settings:', optimizer.optimizedSettings);
        
        return optimizer;
    }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        GPUOptimizer.applyOptimizations();
    });
}