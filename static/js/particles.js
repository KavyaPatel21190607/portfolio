// ===== PARTICLE SYSTEM FOR AMBIENT EFFECTS =====

class ParticleSystem {
    constructor() {
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.particles = [];
        this.particleGeometry = null;
        this.particleMaterial = null;
        this.particleSystem = null;
        this.animationId = null;
        this.isInitialized = false;
        
        // Configuration
        this.config = {
            particleCount: 200,
            particleSize: 2,
            speed: 0.5,
            spread: 100,
            colors: [0x00ffff, 0x8b5cf6, 0xffd700, 0xff00ff],
            opacity: 0.6,
            interactive: true
        };
        
        // Mouse interaction
        this.mouse = { x: 0, y: 0 };
        this.mouseInfluence = 50;
        
        // Performance monitoring
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 60;
    }
    
    /**
     * Initialize the particle system
     */
    init() {
        try {
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js library not loaded');
            }
            
            this.createRenderer();
            this.createScene();
            this.createCamera();
            this.createParticles();
            this.setupEventListeners();
            this.startAnimation();
            
            this.isInitialized = true;
            console.log('Particle system initialized successfully');
        } catch (error) {
            console.warn('Failed to initialize particle system:', error);
            this.showFallback();
        }
    }
    
    /**
     * Show fallback for unsupported devices
     */
    showFallback() {
        const container = document.getElementById('particles-background');
        if (container) {
            container.innerHTML = '<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.05) 0%, transparent 50%); pointer-events: none; z-index: -1;"></div>';
        }
    }
    
    /**
     * Create WebGL renderer
     */
    createRenderer() {
        const container = document.getElementById('particles-background');
        if (!container) {
            throw new Error('Particles container not found');
        }
        
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false, // Disable for performance
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        // Enable depth testing but disable depth writing for particles
        this.renderer.sortObjects = false;
        
        container.appendChild(this.renderer.domElement);
    }
    
    /**
     * Create Three.js scene
     */
    createScene() {
        this.scene = new THREE.Scene();
        
        // Add subtle fog for depth
        this.scene.fog = new THREE.FogExp2(0x000000, 0.001);
    }
    
    /**
     * Create camera
     */
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        
        this.camera.position.z = 100;
    }
    
    /**
     * Create particle system
     */
    createParticles() {
        // Create geometry
        this.particleGeometry = new THREE.BufferGeometry();
        
        // Arrays for particle attributes
        const positions = new Float32Array(this.config.particleCount * 3);
        const colors = new Float32Array(this.config.particleCount * 3);
        const sizes = new Float32Array(this.config.particleCount);
        const velocities = new Float32Array(this.config.particleCount * 3);
        const originalPositions = new Float32Array(this.config.particleCount * 3);
        
        // Initialize particle properties
        for (let i = 0; i < this.config.particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * this.config.spread * 2;
            positions[i3 + 1] = (Math.random() - 0.5) * this.config.spread * 2;
            positions[i3 + 2] = (Math.random() - 0.5) * this.config.spread;
            
            // Store original positions for wave effects
            originalPositions[i3] = positions[i3];
            originalPositions[i3 + 1] = positions[i3 + 1];
            originalPositions[i3 + 2] = positions[i3 + 2];
            
            // Velocity
            velocities[i3] = (Math.random() - 0.5) * this.config.speed;
            velocities[i3 + 1] = (Math.random() - 0.5) * this.config.speed;
            velocities[i3 + 2] = (Math.random() - 0.5) * this.config.speed;
            
            // Color
            const colorIndex = Math.floor(Math.random() * this.config.colors.length);
            const color = new THREE.Color(this.config.colors[colorIndex]);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Size
            sizes[i] = Math.random() * this.config.particleSize + 0.5;
        }
        
        // Set attributes
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Store additional data
        this.particleGeometry.userData = {
            velocities: velocities,
            originalPositions: originalPositions
        };
        
        // Create material
        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            transparent: true,
            depthTest: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        // Create particle system
        this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.scene.add(this.particleSystem);
    }
    
    /**
     * Get vertex shader for particles
     */
    getVertexShader() {
        return `
            attribute float size;
            uniform float time;
            uniform float pixelRatio;
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                
                // Add subtle floating animation
                mvPosition.y += sin(time * 0.5 + position.x * 0.01) * 2.0;
                mvPosition.x += cos(time * 0.3 + position.z * 0.01) * 1.5;
                
                gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }
    
    /**
     * Get fragment shader for particles
     */
    getFragmentShader() {
        return `
            uniform float time;
            varying vec3 vColor;
            
            void main() {
                // Create circular particles
                vec2 center = gl_PointCoord - vec2(0.5);
                float distance = length(center);
                
                if (distance > 0.5) discard;
                
                // Soft glow effect
                float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                alpha *= 0.8; // Base opacity
                
                // Add pulsing effect
                alpha *= 0.5 + 0.5 * sin(time * 2.0);
                
                gl_FragColor = vec4(vColor, alpha);
            }
        `;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mouse movement
        if (this.config.interactive) {
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            });
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimation();
            } else {
                this.resumeAnimation();
            }
        });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.renderer || !this.camera) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    /**
     * Start animation loop
     */
    startAnimation() {
        const animate = (currentTime) => {
            this.animationId = requestAnimationFrame(animate);
            
            // Performance monitoring
            this.updatePerformance(currentTime);
            
            // Update particles
            this.updateParticles(currentTime);
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate(0);
    }
    
    /**
     * Update particle positions and properties
     */
    updateParticles(currentTime) {
        if (!this.particleGeometry || !this.particleMaterial) return;
        
        const time = currentTime * 0.001; // Convert to seconds
        const positions = this.particleGeometry.attributes.position.array;
        const velocities = this.particleGeometry.userData.velocities;
        const originalPositions = this.particleGeometry.userData.originalPositions;
        
        // Update material uniform
        this.particleMaterial.uniforms.time.value = time;
        
        // Update particle positions
        for (let i = 0; i < this.config.particleCount; i++) {
            const i3 = i * 3;
            
            // Basic movement
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];
            
            // Mouse interaction
            if (this.config.interactive) {
                const mouseX = this.mouse.x * this.config.spread;
                const mouseY = this.mouse.y * this.config.spread;
                
                const dx = positions[i3] - mouseX;
                const dy = positions[i3 + 1] - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouseInfluence) {
                    const force = (this.mouseInfluence - distance) / this.mouseInfluence;
                    positions[i3] += dx * force * 0.02;
                    positions[i3 + 1] += dy * force * 0.02;
                }
            }
            
            // Boundary wrapping
            if (positions[i3] > this.config.spread) {
                positions[i3] = -this.config.spread;
            } else if (positions[i3] < -this.config.spread) {
                positions[i3] = this.config.spread;
            }
            
            if (positions[i3 + 1] > this.config.spread) {
                positions[i3 + 1] = -this.config.spread;
            } else if (positions[i3 + 1] < -this.config.spread) {
                positions[i3 + 1] = this.config.spread;
            }
            
            if (positions[i3 + 2] > this.config.spread / 2) {
                positions[i3 + 2] = -this.config.spread / 2;
            } else if (positions[i3 + 2] < -this.config.spread / 2) {
                positions[i3 + 2] = this.config.spread / 2;
            }
        }
        
        // Mark positions as needing update
        this.particleGeometry.attributes.position.needsUpdate = true;
    }
    
    /**
     * Update based on scroll position
     */
    updateScroll(scrollProgress) {
        if (!this.particleSystem) return;
        
        // Rotate particle system based on scroll
        this.particleSystem.rotation.y = scrollProgress * Math.PI * 0.5;
        this.particleSystem.rotation.x = scrollProgress * Math.PI * 0.1;
        
        // Adjust particle spread
        const baseSpread = this.config.spread;
        const currentSpread = baseSpread * (1 + scrollProgress * 0.5);
        
        // Update camera position
        this.camera.position.z = 100 + scrollProgress * 50;
    }
    
    /**
     * Update performance monitoring
     */
    updatePerformance(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
            this.lastFrameTime = currentTime;
            this.frameCount = 0;
            
            // Adjust quality based on performance
            this.adjustQuality();
        }
    }
    
    /**
     * Adjust particle quality based on performance
     */
    adjustQuality() {
        if (this.fps < 30 && this.config.particleCount > 50) {
            // Reduce particle count for better performance
            this.config.particleCount = Math.max(50, this.config.particleCount * 0.8);
            console.warn(`Low FPS detected (${this.fps}). Reducing particle count to ${this.config.particleCount}`);
        } else if (this.fps > 55 && this.config.particleCount < 200) {
            // Increase particle count if performance is good
            this.config.particleCount = Math.min(200, this.config.particleCount * 1.1);
        }
    }
    
    /**
     * Pause animation
     */
    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Resume animation
     */
    resumeAnimation() {
        if (!this.animationId && this.isInitialized) {
            this.startAnimation();
        }
    }
    
    /**
     * Destroy particle system
     */
    destroy() {
        this.pauseAnimation();
        
        if (this.particleGeometry) {
            this.particleGeometry.dispose();
        }
        
        if (this.particleMaterial) {
            this.particleMaterial.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            
            const container = document.getElementById('particles-background');
            if (container && this.renderer.domElement) {
                container.removeChild(this.renderer.domElement);
            }
        }
        
        this.isInitialized = false;
        console.log('Particle system destroyed');
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.isInitialized) {
            // Recreate particles with new configuration
            this.scene.remove(this.particleSystem);
            this.createParticles();
        }
    }
    
    /**
     * Get current performance stats
     */
    getStats() {
        return {
            fps: this.fps,
            particleCount: this.config.particleCount,
            isInitialized: this.isInitialized
        };
    }
}

// ===== EXPORT FOR USE IN OTHER MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}
