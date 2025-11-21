// ===== 3D RENDERER FOR IMMERSIVE PORTFOLIO EXPERIENCES =====

class Renderer3D {
    constructor() {
        this.scenes = new Map();
        this.renderers = new Map();
        this.cameras = new Map();
        this.controls = new Map();
        this.animationMixers = [];
        this.clock = new THREE.Clock();
        this.isInitialized = false;
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 60;
        
        // Asset loading
        this.textureLoader = new THREE.TextureLoader();
        this.loadedModels = new Map();
        this.loadedTextures = new Map();
    }
    
    /**
     * Initialize the 3D renderer system
     */
    async init() {
        try {
            await this.checkWebGLSupport();
            this.initializeHero3D();
            this.initializeAbout3D();
            this.startRenderLoop();
            
            this.isInitialized = true;
            console.log('3D Renderer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize 3D renderer:', error);
            this.showFallback();
        }
    }
    
    /**
     * Check WebGL support
     */
    async checkWebGLSupport() {
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js library not loaded');
        }
        
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        
        return true;
    }
    
    /**
     * Initialize hero section 3D scene
     */
    initializeHero3D() {
        const container = document.getElementById('hero-3d-model');
        if (!container) return;
        
        // Create scene
        const scene = new THREE.Scene();
        this.scenes.set('hero', scene);
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 5);
        this.cameras.set('hero', camera);
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        
        container.appendChild(renderer.domElement);
        this.renderers.set('hero', renderer);
        
        // Add lighting
        this.addHeroLighting(scene);
        
        // Create main 3D object
        this.createHeroGeometry(scene);
        
        // Add mouse interaction
        this.addHeroInteraction(container, camera, scene);
        
        // Handle resize
        this.handleHeroResize(container, camera, renderer);
    }
    
    /**
     * Add realistic lighting to hero scene
     */
    addHeroLighting(scene) {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);
        
        // Directional light (main)
        const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.0);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        scene.add(directionalLight);
        
        // Point lights for accent
        const pointLight1 = new THREE.PointLight(0x8b5cf6, 0.5, 100);
        pointLight1.position.set(-5, 3, 3);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xffd700, 0.3, 100);
        pointLight2.position.set(3, -3, 2);
        scene.add(pointLight2);
        
        // Add light helpers in development
        if (window.location.hostname === 'localhost') {
            scene.add(new THREE.DirectionalLightHelper(directionalLight, 1));
            scene.add(new THREE.PointLightHelper(pointLight1, 0.5));
            scene.add(new THREE.PointLightHelper(pointLight2, 0.5));
        }
    }
    
    /**
     * Create main hero geometry
     */
    createHeroGeometry(scene) {
        // Create complex geometry with multiple shapes
        const group = new THREE.Group();
        
        // Main sphere with glassmorphism effect
        const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
        const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x00ffff,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9,
            transparent: true,
            opacity: 0.8,
            ior: 1.4,
            thickness: 0.5,
            envMapIntensity: 1
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        group.add(sphere);
        
        // Orbiting rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(2 + i * 0.5, 0.05, 8, 100);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: [0x00ffff, 0x8b5cf6, 0xffd700][i],
                emissive: [0x00ffff, 0x8b5cf6, 0xffd700][i],
                emissiveIntensity: 0.3,
                metalness: 0.8,
                roughness: 0.2
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2 + (i * Math.PI / 6);
            ring.rotation.z = i * Math.PI / 3;
            ring.userData = { rotationSpeed: 0.01 + i * 0.005, axis: i };
            group.add(ring);
        }
        
        // Floating particles around the main object
        this.createFloatingParticles(group);
        
        group.userData = { type: 'hero-main' };
        scene.add(group);
    }
    
    /**
     * Create floating particles around hero object
     */
    createFloatingParticles(parentGroup) {
        // Use GPU optimizer settings for particle count
        const particleCount = window.gpuOptimizer?.optimizedSettings?.particleCount || 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Random spherical distribution
            const radius = 3 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random colors
            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.7, 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            sizes[i] = Math.random() * 10 + 5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float distance = length(center);
                    if (distance > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData = { type: 'floating-particles', material };
        parentGroup.add(particles);
    }
    
    /**
     * Add mouse interaction to hero scene
     */
    addHeroInteraction(container, camera, scene) {
        let mouseX = 0;
        let mouseY = 0;
        
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        });
        
        // Store mouse coordinates for animation loop
        scene.userData.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        
        container.addEventListener('mousemove', () => {
            scene.userData.mouse.targetX = mouseX;
            scene.userData.mouse.targetY = mouseY;
        });
    }
    
    /**
     * Handle hero section resize
     */
    handleHeroResize(container, camera, renderer) {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        });
        
        resizeObserver.observe(container);
    }
    
    /**
     * Initialize about section 3D scene
     */
    initializeAbout3D() {
        const container = document.getElementById('about-3d-scene');
        if (!container) return;
        
        // Create scene
        const scene = new THREE.Scene();
        this.scenes.set('about', scene);
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 5);
        this.cameras.set('about', camera);
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        
        container.appendChild(renderer.domElement);
        this.renderers.set('about', renderer);
        
        // Add lighting
        this.addAboutLighting(scene);
        
        // Create skill visualization
        this.createSkillVisualization(scene);
        
        // Handle resize
        this.handleAboutResize(container, camera, renderer);
    }
    
    /**
     * Add lighting to about scene
     */
    addAboutLighting(scene) {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x8b5cf6, 0.8);
        directionalLight.position.set(3, 3, 3);
        scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x00ffff, 0.6, 100);
        pointLight.position.set(-3, 2, 3);
        scene.add(pointLight);
    }
    
    /**
     * Create skill visualization
     */
    createSkillVisualization(scene) {
        const skills = [
            { name: 'JavaScript', level: 0.9, color: 0xf7df1e },
            { name: 'Python', level: 0.95, color: 0x3776ab },
            { name: 'React', level: 0.85, color: 0x61dafb },
            { name: 'Three.js', level: 0.75, color: 0x000000 },
            { name: 'Node.js', level: 0.8, color: 0x339933 },
            { name: 'CSS', level: 0.9, color: 0x1572b6 }
        ];
        
        const group = new THREE.Group();
        
        skills.forEach((skill, index) => {
            const angle = (index / skills.length) * Math.PI * 2;
            const radius = 2;
            
            // Skill bar as extruded geometry
            const barGeometry = new THREE.BoxGeometry(0.2, skill.level * 2, 0.2);
            const barMaterial = new THREE.MeshStandardMaterial({
                color: skill.color,
                emissive: skill.color,
                emissiveIntensity: 0.2,
                metalness: 0.5,
                roughness: 0.3
            });
            
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.x = Math.cos(angle) * radius;
            bar.position.z = Math.sin(angle) * radius;
            bar.position.y = skill.level - 1;
            
            bar.userData = { 
                skill: skill.name, 
                level: skill.level,
                originalY: bar.position.y,
                rotationSpeed: 0.01 + Math.random() * 0.01
            };
            
            group.add(bar);
        });
        
        group.userData = { type: 'skills' };
        scene.add(group);
    }
    
    /**
     * Handle about section resize
     */
    handleAboutResize(container, camera, renderer) {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        });
        
        resizeObserver.observe(container);
    }
    
    /**
     * Start the main render loop
     */
    startRenderLoop() {
        const animate = (currentTime) => {
            requestAnimationFrame(animate);
            
            const deltaTime = this.clock.getDelta();
            
            // Update performance stats
            this.updatePerformanceStats(currentTime);
            
            // Update all scenes
            this.updateScenes(deltaTime, currentTime);
            
            // Render all scenes
            this.renderScenes();
        };
        
        animate(0);
    }
    
    /**
     * Update all 3D scenes
     */
    updateScenes(deltaTime, currentTime) {
        // Update hero scene
        this.updateHeroScene(deltaTime, currentTime);
        
        // Update about scene
        this.updateAboutScene(deltaTime, currentTime);
        
        // Update animation mixers
        this.animationMixers.forEach(mixer => {
            mixer.update(deltaTime);
        });
    }
    
    /**
     * Update hero scene animations
     */
    updateHeroScene(deltaTime, currentTime) {
        const scene = this.scenes.get('hero');
        if (!scene) return;
        
        const time = currentTime * 0.001;
        
        scene.traverse((object) => {
            if (object.userData.type === 'hero-main') {
                // Main group rotation
                object.rotation.y += 0.005;
                
                // Update child objects
                object.children.forEach((child) => {
                    if (child.userData.rotationSpeed) {
                        // Orbiting rings
                        if (child.userData.axis !== undefined) {
                            child.rotation.z += child.userData.rotationSpeed;
                            child.rotation.x += child.userData.rotationSpeed * 0.5;
                        }
                    }
                    
                    if (child.userData.type === 'floating-particles') {
                        // Update particle shader time
                        child.userData.material.uniforms.time.value = time;
                    }
                });
                
                // Mouse interaction
                if (scene.userData.mouse) {
                    const mouse = scene.userData.mouse;
                    
                    // Smooth mouse following
                    mouse.x += (mouse.targetX - mouse.x) * 0.05;
                    mouse.y += (mouse.targetY - mouse.y) * 0.05;
                    
                    // Apply mouse influence
                    object.rotation.x = mouse.y * 0.3;
                    object.rotation.y += mouse.x * 0.2;
                }
            }
        });
    }
    
    /**
     * Update about scene animations
     */
    updateAboutScene(deltaTime, currentTime) {
        const scene = this.scenes.get('about');
        if (!scene) return;
        
        const time = currentTime * 0.001;
        
        scene.traverse((object) => {
            if (object.userData.type === 'skills') {
                object.rotation.y += 0.01;
                
                // Animate skill bars
                object.children.forEach((bar, index) => {
                    if (bar.userData.skill) {
                        // Floating animation
                        bar.position.y = bar.userData.originalY + Math.sin(time + index) * 0.2;
                        
                        // Individual rotation
                        bar.rotation.y += bar.userData.rotationSpeed;
                    }
                });
            }
        });
    }
    
    /**
     * Render all scenes
     */
    renderScenes() {
        this.renderers.forEach((renderer, key) => {
            const scene = this.scenes.get(key);
            const camera = this.cameras.get(key);
            
            if (scene && camera) {
                renderer.render(scene, camera);
            }
        });
    }
    
    /**
     * Update performance statistics
     */
    updatePerformanceStats(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.lastTime = currentTime;
            this.frameCount = 0;
            
            // Log performance warnings
            if (this.fps < 30) {
                console.warn(`3D Renderer: Low FPS detected (${this.fps})`);
            }
        }
    }
    
    /**
     * Show fallback for unsupported devices
     */
    showFallback() {
        const containers = ['hero-3d-model', 'about-3d-scene'];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        background: linear-gradient(135deg, #00ffff, #8b5cf6);
                        border-radius: 16px;
                        color: white;
                        text-align: center;
                        padding: 2rem;
                    ">
                        <div>
                            <i class="fas fa-cube" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <h3>3D Experience</h3>
                            <p>Advanced 3D features require WebGL support</p>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    /**
     * Dispose of all resources
     */
    dispose() {
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Dispose of renderers
        this.renderers.forEach(renderer => {
            renderer.dispose();
        });
        
        // Dispose of geometries and materials
        this.scenes.forEach(scene => {
            scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        });
        
        console.log('3D Renderer disposed');
    }
    
    /**
     * Get performance statistics
     */
    getStats() {
        return {
            fps: this.fps,
            sceneCount: this.scenes.size,
            rendererCount: this.renderers.size,
            isInitialized: this.isInitialized
        };
    }
}

// ===== EXPORT FOR USE IN OTHER MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer3D;
}
