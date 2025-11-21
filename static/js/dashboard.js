// ===== DASHBOARD 3D INTERACTIVE FEATURES =====

class Dashboard3D {
    constructor() {
        this.apiClient = new APIClient();
        this.widgets = new Map();
        this.renderers = new Map();
        this.scenes = new Map();
        this.cameras = new Map();
        this.animationId = null;
        this.clock = new THREE.Clock();
        this.currentTheme = 'dark';
        
        // Data storage
        this.projectsData = [];
        this.skillsData = {};
        this.testimonialsData = [];
        this.timelineData = [];
        this.statsData = [];
        this.socialData = [];
        
        this.init();
    }
    
    /**
     * Initialize dashboard
     */
    async init() {
        try {
            // Check if Three.js is available
            if (typeof THREE === 'undefined') {
                console.warn('Three.js not loaded, using fallback dashboard');
                await this.loadData();
                this.initializeFallbackWidgets();
                return;
            }
            
            await this.loadData();
            this.initializeWidgets();
            this.initializeThemeSwitcher();
            this.initializeChat();
            this.startAnimationLoop();
            
            console.log('Dashboard 3D initialized successfully');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showDataError();
        }
    }
    
    /**
     * Load all required data
     */
    async loadData() {
        console.log('Loading dashboard data...');
        
        // Load projects data directly
        try {
            const response = await fetch('/api/projects');
            if (response.ok) {
                this.projectsData = await response.json();
                console.log(`Loaded ${this.projectsData.length} projects from database`);
            } else {
                throw new Error(`Projects API failed: ${response.status}`);
            }
        } catch (error) {
            console.warn('Failed to load projects:', error);
            this.projectsData = [];
        }
        
        // Load skills data directly
        try {
            const response = await fetch('/api/skills');
            if (response.ok) {
                this.skillsData = await response.json();
                console.log('Loaded skills data from database');
            } else {
                throw new Error(`Skills API failed: ${response.status}`);
            }
        } catch (error) {
            console.warn('Failed to load skills:', error);
            this.skillsData = {};
        }
        
        // Load testimonials data directly
        try {
            const response = await fetch('/api/testimonials');
            if (response.ok) {
                this.testimonialsData = await response.json();
                console.log(`Loaded ${this.testimonialsData.length} testimonials from database`);
            } else {
                throw new Error(`Testimonials API failed: ${response.status}`);
            }
        } catch (error) {
            console.warn('Failed to load testimonials:', error);
            this.testimonialsData = [];
        }
        
        // Load timeline data directly
        try {
            const response = await fetch('/api/timeline');
            if (response.ok) {
                this.timelineData = await response.json();
                console.log(`Loaded ${this.timelineData.length} timeline items from database`);
            } else {
                throw new Error(`Timeline API failed: ${response.status}`);
            }
        } catch (error) {
            console.warn('Failed to load timeline:', error);
            this.timelineData = [];
        }
        
        // Load stats data directly
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                this.statsData = await response.json();
                console.log(`Loaded ${this.statsData.length} stats from database`);
            } else {
                throw new Error(`Stats API failed: ${response.status}`);
            }
        } catch (error) {
            console.warn('Failed to load stats:', error);
            this.statsData = [];
        }
        
        // Load achievements data
        try {
            const response = await fetch('/api/achievements');
            if (response.ok) {
                this.achievementsData = await response.json();
                const totalAchievements = Object.values(this.achievementsData).reduce((sum, category) => sum + category.length, 0);
                console.log(`Loaded ${totalAchievements} achievements from database`);
            } else {
                throw new Error(`Achievements API failed: ${response.status}`);
            }
        } catch (error) {
            console.warn('Failed to load achievements:', error);
            this.achievementsData = {};
        }
        
        // Initialize social data placeholder
        this.socialData = [];
        
        console.log('Data loading completed, initializing widgets...');
        
        try {
            // Check if Three.js is available and try 3D widgets first
            if (typeof THREE !== 'undefined') {
                console.log('Three.js available, initializing 3D widgets...');
                this.initializeWidgets();
            } else {
                console.log('Three.js not available, using fallback widgets...');
                this.initializeFallbackWidgets();
            }
            console.log('Widgets initialized successfully');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            console.log('Falling back to 2D widgets...');
            this.initializeFallbackWidgets();
        }
    }
    
    /**
     * Initialize all dashboard widgets
     */
    initializeWidgets() {
        this.initProjectGallery3D();
        this.initSkillsSphere3D();
        this.initTimeline3D();
        this.initContactForm3D();
        
        // Use fallback methods for widgets that don't have 3D implementations yet
        this.populateProjectGallery();
        this.populateSkillsDisplay();
        this.populateTimeline();
        this.populateTestimonials();
        this.populateStats();
        this.populateAchievements();
    }
    
    /**
     * Initialize 3D Project Gallery
     */
    initProjectGallery3D() {
        const container = document.getElementById('project-gallery-3d');
        if (!container) return;
        
        const { scene, camera, renderer } = this.createBasicScene(container, 'project-gallery');
        
        // Create project cards in 3D space
        const cardGroup = new THREE.Group();
        
        this.projectsData.forEach((project, index) => {
            const card = this.createProjectCard3D(project, index);
            cardGroup.add(card);
        });
        
        scene.add(cardGroup);
        scene.userData.cardGroup = cardGroup;
        
        // Add lighting
        this.addStandardLighting(scene);
        
        // Add interaction
        this.addProjectGalleryInteraction(container, scene, camera);
        
        // Store references
        this.widgets.set('project-gallery', { scene, camera, renderer, container });
    }
    
    /**
     * Create 3D project card
     */
    createProjectCard3D(project, index) {
        const cardGroup = new THREE.Group();
        
        // Card background
        const cardGeometry = new THREE.BoxGeometry(2, 2.5, 0.1);
        const cardMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a2e,
            metalness: 0.1,
            roughness: 0.3,
            transmission: 0.1,
            transparent: true,
            opacity: 0.9
        });
        
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        card.castShadow = true;
        card.receiveShadow = true;
        
        // Position cards in a grid
        const cols = 3;
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        card.position.x = (col - 1) * 2.5;
        card.position.y = (1 - row) * 3;
        card.position.z = 0;
        
        // Add hover effect data
        card.userData = {
            project: project,
            originalPosition: card.position.clone(),
            originalRotation: card.rotation.clone(),
            index: index
        };
        
        cardGroup.add(card);
        
        // Add project title as 3D text (simplified)
        const titleGeometry = new THREE.BoxGeometry(1.8, 0.2, 0.05);
        const titleMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.2
        });
        
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.y = 0.8;
        titleMesh.position.z = 0.1;
        card.add(titleMesh);
        
        return card;
    }
    
    /**
     * Add project gallery interactions
     */
    addProjectGalleryInteraction(container, scene, camera) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredCard = null;
        
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.userData.cardGroup.children, true);
            
            // Reset previous hover
            if (hoveredCard) {
                this.resetCardHover(hoveredCard);
                hoveredCard = null;
            }
            
            // Apply new hover
            if (intersects.length > 0) {
                hoveredCard = intersects[0].object;
                this.applyCardHover(hoveredCard);
                container.style.cursor = 'pointer';
            } else {
                container.style.cursor = 'default';
            }
        });
        
        container.addEventListener('click', (event) => {
            if (hoveredCard) {
                this.showProjectDetails(hoveredCard.userData.project);
            }
        });
        
        // Add filter functionality
        this.initProjectFilters();
    }
    
    /**
     * Apply hover effect to project card
     */
    applyCardHover(card) {
        if (!card.userData) return;
        
        // Animate card
        card.position.z = 0.5;
        card.rotation.x = 0.1;
        card.scale.set(1.1, 1.1, 1.1);
        
        // Add glow effect
        card.material.emissive.setHex(0x003333);
        card.material.emissiveIntensity = 0.3;
    }
    
    /**
     * Reset card hover effect
     */
    resetCardHover(card) {
        if (!card.userData) return;
        
        card.position.copy(card.userData.originalPosition);
        card.rotation.copy(card.userData.originalRotation);
        card.scale.set(1, 1, 1);
        card.material.emissive.setHex(0x000000);
        card.material.emissiveIntensity = 0;
    }
    
    /**
     * Initialize project filters
     */
    initProjectFilters() {
        const filterButtons = document.querySelectorAll('#project-gallery-widget .filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterProjects(filter);
                
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    
    /**
     * Filter projects in 3D gallery
     */
    filterProjects(filter) {
        const widget = this.widgets.get('project-gallery');
        if (!widget) return;
        
        const cardGroup = widget.scene.userData.cardGroup;
        
        cardGroup.children.forEach((card, index) => {
            const project = card.userData.project;
            const shouldShow = filter === 'all' || project.category === filter;
            
            if (shouldShow) {
                // Animate in
                card.visible = true;
                card.scale.set(0.1, 0.1, 0.1);
                
                // Stagger animation
                setTimeout(() => {
                    this.animateCardIn(card);
                }, index * 100);
            } else {
                // Animate out
                this.animateCardOut(card);
            }
        });
    }
    
    /**
     * Animate card in
     */
    animateCardIn(card) {
        const duration = 500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const scale = this.easeOutBack(progress);
            
            card.scale.set(scale, scale, scale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Animate card out
     */
    animateCardOut(card) {
        const duration = 300;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const scale = 1 - progress;
            
            card.scale.set(scale, scale, scale);
            
            if (progress >= 1) {
                card.visible = false;
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Initialize Skills Sphere 3D
     */
    initSkillsSphere3D() {
        const container = document.getElementById('skills-sphere-3d');
        if (!container) return;
        
        const { scene, camera, renderer } = this.createBasicScene(container, 'skills-sphere');
        
        // Create skills sphere
        const sphereGroup = this.createSkillsSphere();
        scene.add(sphereGroup);
        
        // Add lighting
        this.addStandardLighting(scene);
        
        // Add interaction
        this.addSkillsSphereInteraction(container, scene, camera);
        
        this.widgets.set('skills-sphere', { scene, camera, renderer, container });
    }
    
    /**
     * Create skills sphere
     */
    createSkillsSphere() {
        const group = new THREE.Group();
        const radius = 2;
        
        Object.keys(this.skillsData).forEach((category, categoryIndex) => {
            const skills = this.skillsData[category];
            const categoryColors = {
                'Frontend': 0x00ffff,
                'Backend': 0x8b5cf6,
                'Graphics': 0xffd700,
                'AI': 0xff00ff,
                'DevOps': 0x00ff00,
                'Cloud': 0xff8800
            };
            
            skills.forEach((skill, skillIndex) => {
                const phi = Math.acos(-1 + (2 * (categoryIndex * skills.length + skillIndex)) / (Object.keys(this.skillsData).length * 5));
                const theta = Math.sqrt((Object.keys(this.skillsData).length * 5) * Math.PI) * phi;
                
                const x = radius * Math.cos(theta) * Math.sin(phi);
                const y = radius * Math.sin(theta) * Math.sin(phi);
                const z = radius * Math.cos(phi);
                
                // Create skill node
                const nodeGeometry = new THREE.SphereGeometry(0.1 + skill.proficiency * 0.1, 16, 16);
                const nodeMaterial = new THREE.MeshStandardMaterial({
                    color: categoryColors[category] || 0xffffff,
                    emissive: categoryColors[category] || 0xffffff,
                    emissiveIntensity: 0.2,
                    metalness: 0.5,
                    roughness: 0.3
                });
                
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                node.position.set(x, y, z);
                
                node.userData = {
                    skill: skill,
                    category: category,
                    originalScale: node.scale.clone()
                };
                
                group.add(node);
            });
        });
        
        group.userData = { type: 'skills-sphere' };
        return group;
    }
    
    /**
     * Add skills sphere interaction
     */
    addSkillsSphereInteraction(container, scene, camera) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredSkill = null;
        
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const skillNodes = [];
            
            scene.traverse((child) => {
                if (child.userData.skill) {
                    skillNodes.push(child);
                }
            });
            
            const intersects = raycaster.intersectObjects(skillNodes);
            
            // Reset previous hover
            if (hoveredSkill) {
                this.resetSkillHover(hoveredSkill);
                hoveredSkill = null;
            }
            
            // Apply new hover
            if (intersects.length > 0) {
                hoveredSkill = intersects[0].object;
                this.applySkillHover(hoveredSkill);
                this.showSkillInfo(hoveredSkill.userData.skill, hoveredSkill.userData.category);
            } else {
                this.hideSkillInfo();
            }
        });
        
        // Add rotation controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        container.addEventListener('mousedown', () => { isDragging = true; });
        container.addEventListener('mouseup', () => { isDragging = false; });
        
        container.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const deltaMove = {
                    x: event.offsetX - previousMousePosition.x,
                    y: event.offsetY - previousMousePosition.y
                };
                
                scene.children.forEach(child => {
                    if (child.userData.type === 'skills-sphere') {
                        child.rotation.y += deltaMove.x * 0.01;
                        child.rotation.x += deltaMove.y * 0.01;
                    }
                });
            }
            
            previousMousePosition = { x: event.offsetX, y: event.offsetY };
        });
    }
    
    /**
     * Apply skill hover effect
     */
    applySkillHover(skillNode) {
        skillNode.scale.multiplyScalar(1.5);
        skillNode.material.emissiveIntensity = 0.5;
    }
    
    /**
     * Reset skill hover effect
     */
    resetSkillHover(skillNode) {
        skillNode.scale.copy(skillNode.userData.originalScale);
        skillNode.material.emissiveIntensity = 0.2;
    }
    
    /**
     * Show skill information
     */
    showSkillInfo(skill, category) {
        const infoPanel = document.getElementById('skill-info');
        if (!infoPanel) return;
        
        infoPanel.innerHTML = `
            <h4>${skill.name}</h4>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Proficiency:</strong> ${skill.proficiency}%</p>
            <p><strong>Experience:</strong> ${skill.years_experience} years</p>
        `;
    }
    
    /**
     * Hide skill information
     */
    hideSkillInfo() {
        const infoPanel = document.getElementById('skill-info');
        if (!infoPanel) return;
        
        infoPanel.innerHTML = '<h4>Hover over skills to learn more</h4>';
    }
    
    /**
     * Initialize Timeline 3D
     */
    initTimeline3D() {
        const container = document.getElementById('timeline-3d');
        if (!container) return;
        
        const { scene, camera, renderer } = this.createBasicScene(container, 'timeline');
        
        // Create timeline
        const timelineGroup = this.createTimeline3D();
        scene.add(timelineGroup);
        
        // Add lighting
        this.addStandardLighting(scene);
        
        // Add controls
        this.initTimelineControls();
        
        this.widgets.set('timeline', { scene, camera, renderer, container });
    }
    
    /**
     * Create 3D timeline
     */
    createTimeline3D() {
        const group = new THREE.Group();
        const timelineHeight = 4;
        
        // Create timeline spine
        const spineGeometry = new THREE.CylinderGeometry(0.02, 0.02, timelineHeight, 8);
        const spineMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.2
        });
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        group.add(spine);
        
        // Add timeline items
        this.timelineData.forEach((item, index) => {
            const y = (timelineHeight / 2) - (index * (timelineHeight / this.timelineData.length));
            
            // Create timeline node
            const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const nodeMaterial = new THREE.MeshStandardMaterial({
                color: item.current ? 0xffd700 : 0x8b5cf6,
                emissive: item.current ? 0xffd700 : 0x8b5cf6,
                emissiveIntensity: 0.3
            });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.y = y;
            
            // Create info panel
            const panelGeometry = new THREE.BoxGeometry(2, 0.5, 0.1);
            const panelMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x1a1a2e,
                transmission: 0.1,
                transparent: true,
                opacity: 0.9
            });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.set(1.5, y, 0);
            
            node.userData = { timelineItem: item };
            panel.userData = { timelineItem: item };
            
            group.add(node);
            group.add(panel);
        });
        
        group.userData = { type: 'timeline', currentIndex: 0 };
        return group;
    }
    
    /**
     * Initialize timeline controls
     */
    initTimelineControls() {
        const controls = document.querySelectorAll('.timeline-control');
        
        controls.forEach(control => {
            control.addEventListener('click', () => {
                const action = control.getAttribute('data-action');
                this.navigateTimeline(action);
            });
        });
    }
    
    /**
     * Navigate timeline
     */
    navigateTimeline(direction) {
        const widget = this.widgets.get('timeline');
        if (!widget) return;
        
        const timelineGroup = widget.scene.children.find(child => child.userData.type === 'timeline');
        if (!timelineGroup) return;
        
        const currentIndex = timelineGroup.userData.currentIndex;
        const maxIndex = this.timelineData.length - 1;
        
        let newIndex;
        if (direction === 'next') {
            newIndex = Math.min(currentIndex + 1, maxIndex);
        } else {
            newIndex = Math.max(currentIndex - 1, 0);
        }
        
        if (newIndex !== currentIndex) {
            timelineGroup.userData.currentIndex = newIndex;
            this.focusTimelineItem(newIndex);
        }
    }
    
    /**
     * Focus on timeline item
     */
    focusTimelineItem(index) {
        const widget = this.widgets.get('timeline');
        if (!widget) return;
        
        const camera = widget.camera;
        const targetY = (4 / 2) - (index * (4 / this.timelineData.length));
        
        // Animate camera
        const startY = camera.position.y;
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.easeInOutCubic(progress);
            
            camera.position.y = startY + (targetY - startY) * easedProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Initialize Contact Form 3D
     */
    initContactForm3D() {
        const form = document.getElementById('dashboard-contact-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            try {
                const btn = form.querySelector('.btn-primary');
                this.animateContactButton(btn, 'loading');
                
                const response = await this.apiClient.submitContact(data);
                
                if (response.success) {
                    this.showContactSuccess3D();
                    form.reset();
                } else {
                    throw new Error(response.error);
                }
                
            } catch (error) {
                this.showContactError3D(error.message);
            } finally {
                const btn = form.querySelector('.btn-primary');
                this.animateContactButton(btn, 'normal');
            }
        });
    }
    
    /**
     * Animate contact button
     */
    animateContactButton(button, state) {
        const btnEffect = button.querySelector('.btn-3d-effect');
        
        switch (state) {
            case 'loading':
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                if (btnEffect) btnEffect.style.transform = 'translateZ(-10px)';
                break;
            case 'success':
                button.style.background = 'linear-gradient(135deg, #00ff00, #00aa00)';
                if (btnEffect) btnEffect.style.background = 'linear-gradient(135deg, #00cc00, #008800)';
                break;
            case 'normal':
            default:
                button.disabled = false;
                button.innerHTML = '<span>Send Message</span>';
                button.style.background = '';
                if (btnEffect) {
                    btnEffect.style.transform = 'translateZ(-5px)';
                    btnEffect.style.background = '';
                }
                break;
        }
    }
    
    /**
     * Show 3D contact success animation
     */
    showContactSuccess3D() {
        const feedbackContainer = document.getElementById('contact-feedback-3d');
        if (!feedbackContainer) return;
        
        // Create 3D success animation
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        
        renderer.setSize(200, 100);
        feedbackContainer.appendChild(renderer.domElement);
        
        // Create success checkmark
        const group = new THREE.Group();
        
        // Checkmark geometry (simplified)
        const checkGeometry = new THREE.TorusGeometry(0.5, 0.1, 8, 100);
        const checkMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const check = new THREE.Mesh(checkGeometry, checkMaterial);
        
        group.add(check);
        scene.add(group);
        
        camera.position.z = 2;
        
        // Animate
        let rotation = 0;
        const animate = () => {
            rotation += 0.1;
            group.rotation.z = rotation;
            renderer.render(scene, camera);
            
            if (rotation < Math.PI * 4) {
                requestAnimationFrame(animate);
            } else {
                feedbackContainer.innerHTML = '<p style="color: #00ff00;">Message sent successfully!</p>';
            }
        };
        
        animate();
    }
    
    /**
     * Initialize theme switcher
     */
    initializeThemeSwitcher() {
        const themeSwitcher = document.getElementById('theme-switcher');
        if (!themeSwitcher) return;
        
        themeSwitcher.addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    /**
     * Toggle theme with 3D transition
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        const transition = document.getElementById('theme-transition');
        
        // Show transition overlay
        if (transition) {
            transition.classList.add('active');
        }
        
        setTimeout(() => {
            // Apply theme
            document.body.classList.toggle('light-theme');
            this.currentTheme = newTheme;
            
            // Hide transition
            if (transition) {
                transition.classList.remove('active');
            }
        }, 300);
    }
    
    /**
     * Initialize chat widget
     */
    initializeChat() {
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatMessages = document.getElementById('chat-messages');
        
        if (!chatInput || !chatSend || !chatMessages) return;
        
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;
            
            // Add user message
            this.addChatMessage(message, 'user');
            chatInput.value = '';
            
            // Simulate bot response
            setTimeout(() => {
                const responses = [
                    "Thanks for your message! I'll get back to you soon.",
                    "That's an interesting question. Let me think about it.",
                    "I appreciate your interest in my work!",
                    "Feel free to check out my projects while you wait."
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                this.addChatMessage(response, 'bot');
            }, 1000);
        };
        
        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    /**
     * Add message to chat
     */
    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Create basic 3D scene
     */
    createBasicScene(container, name) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        container.appendChild(renderer.domElement);
        
        camera.position.z = 5;
        
        this.scenes.set(name, scene);
        this.cameras.set(name, camera);
        this.renderers.set(name, renderer);
        
        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            const { width, height } = container.getBoundingClientRect();
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
        resizeObserver.observe(container);
        
        return { scene, camera, renderer };
    }
    
    /**
     * Add standard lighting
     */
    addStandardLighting(scene) {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x8b5cf6, 0.6, 100);
        pointLight.position.set(-3, 2, 3);
        scene.add(pointLight);
    }
    
    /**
     * Start animation loop
     */
    startAnimationLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            const deltaTime = this.clock.getDelta();
            this.updateAllScenes(deltaTime);
            this.renderAllScenes();
        };
        
        animate();
    }
    
    /**
     * Update all scenes
     */
    updateAllScenes(deltaTime) {
        this.scenes.forEach((scene, name) => {
            this.updateScene(scene, name, deltaTime);
        });
    }
    
    /**
     * Update individual scene
     */
    updateScene(scene, name, deltaTime) {
        scene.traverse((object) => {
            // Update rotations
            if (object.userData.type === 'skills-sphere') {
                object.rotation.y += 0.005;
            }
            
            // Update timeline
            if (object.userData.type === 'timeline') {
                // Subtle animation
            }
        });
    }
    
    /**
     * Render all scenes
     */
    renderAllScenes() {
        this.renderers.forEach((renderer, name) => {
            const scene = this.scenes.get(name);
            const camera = this.cameras.get(name);
            
            if (scene && camera) {
                renderer.render(scene, camera);
            }
        });
    }
    
    /**
     * Utility functions
     */
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Initialize fallback widgets when Three.js is not available
     */
    initializeFallbackWidgets() {
        console.log('Starting widget initialization...');
        
        // Wait for DOM to be ready and force populate containers
        setTimeout(() => {
            this.populateProjectGallery();
            this.populateSkillsDisplay();
            this.populateTimeline();
            this.populateTestimonials();
            this.populateStats();
            this.populateAchievements();
            this.initContactForm3D(); // Initialize contact form event handlers
            console.log('All widgets force populated');
        }, 200);
    }
    
    populateProjectGallery() {
        const container = document.getElementById('project-gallery-3d');
        if (!container) {
            console.warn('Project gallery container not found');
            return;
        }
        
        console.log(`Populating gallery with ${this.projectsData.length} projects`);
        
        // Force container to be visible
        container.style.display = 'block';
        container.style.width = '100%';
        container.style.height = 'auto';
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; padding: 1rem; max-height: 400px; overflow-y: auto;">
                ${this.projectsData.map((project, index) => `
                    <div style="
                        background: var(--glass-bg);
                        backdrop-filter: blur(20px);
                        border: 1px solid var(--glass-border);
                        border-radius: 12px;
                        padding: 1rem;
                        transition: all 0.3s ease;
                        animation: slideInUp ${0.1 * (index + 1)}s ease forwards;
                        opacity: 0;
                    " onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="
                                width: 40px;
                                height: 40px;
                                border-radius: 8px;
                                background: var(--gradient-primary);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: bold;
                            ">
                                <i class="fas fa-code"></i>
                            </div>
                            <div>
                                <h4 style="margin: 0; color: var(--text-primary); font-size: 1rem;">${project.title}</h4>
                                <span style="color: var(--neon-cyan); font-size: 0.8rem;">${project.category || 'Development'}</span>
                            </div>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4; margin: 0 0 1rem 0;">
                            ${project.description}
                        </p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                            ${(project.tech_stack || []).slice(0, 3).map(tech => `
                                <span style="
                                    background: var(--surface-bg);
                                    color: var(--neon-purple);
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 6px;
                                    font-size: 0.7rem;
                                    border: 1px solid var(--glass-border);
                                ">${tech}</span>
                            `).join('')}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            ${project.github_url ? `<a href="${project.github_url}" style="color: var(--neon-cyan); text-decoration: none;"><i class="fab fa-github"></i></a>` : ''}
                            ${project.live_url ? `<a href="${project.live_url}" style="color: var(--neon-green); text-decoration: none;"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    populateSkillsDisplay() {
        const container = document.getElementById('skills-sphere-3d');
        if (!container) return;
        
        console.log('Populating skills display');
        
        const skillCategories = this.skillsData;
        const skillsHtml = Object.keys(skillCategories).map(category => `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: var(--neon-cyan); margin: 0 0 1rem 0; font-size: 1rem;">${category}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${skillCategories[category].map(skill => `
                        <span style="
                            background: var(--glass-bg);
                            color: var(--text-primary);
                            padding: 0.5rem 1rem;
                            border-radius: 20px;
                            font-size: 0.8rem;
                            border: 1px solid var(--glass-border);
                            backdrop-filter: blur(10px);
                        ">${skill.name}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div style="padding: 1rem; max-height: 300px; overflow-y: auto;">
                ${skillsHtml}
            </div>
        `;
    }
    
    populateTimeline() {
        const container = document.getElementById('timeline-3d');
        if (!container) return;
        
        console.log(`Populating timeline with ${this.timelineData.length} items`);
        
        const timelineHtml = this.timelineData.map((item, index) => `
            <div style="
                position: relative;
                margin-left: 3rem;
                margin-bottom: 2rem;
                padding: 1rem;
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                animation: slideInRight ${0.2 * (index + 1)}s ease forwards;
                opacity: 0;
            ">
                <div style="
                    position: absolute;
                    left: -2.5rem;
                    top: 1rem;
                    width: 1rem;
                    height: 1rem;
                    background: ${item.current ? 'var(--neon-green)' : 'var(--neon-purple)'};
                    border-radius: 50%;
                    border: 3px solid var(--primary-bg);
                "></div>
                <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${item.title}</h4>
                <p style="margin: 0 0 0.5rem 0; color: var(--neon-cyan); font-size: 0.9rem;">${item.company || ''}</p>
                <p style="margin: 0 0 1rem 0; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4;">${item.description || ''}</p>
                <span style="color: var(--neon-purple); font-size: 0.8rem;">
                    ${item.start_date ? new Date(item.start_date).getFullYear() : ''} - ${item.current ? 'Present' : (item.end_date ? new Date(item.end_date).getFullYear() : '')}
                </span>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div style="padding: 1rem; max-height: 400px; overflow-y: auto; position: relative;">
                <div style="position: absolute; left: 2rem; top: 0; bottom: 0; width: 2px; background: var(--neon-cyan);"></div>
                ${timelineHtml}
            </div>
        `;
    }
    
    populateTestimonials() {
        const container = document.getElementById('testimonial-globe-3d');
        if (!container) return;
        
        console.log(`Populating testimonials with ${this.testimonialsData.length} items`);
        
        const testimonialsHtml = this.testimonialsData.map((testimonial, index) => `
            <div style="
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 1rem;
                transition: all 0.3s ease;
                animation: fadeIn ${0.15 * (index + 1)}s ease forwards;
                opacity: 0;
            ">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: var(--gradient-primary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 1.2rem;
                    ">${testimonial.name.charAt(0)}</div>
                    <div>
                        <h4 style="margin: 0; color: var(--text-primary); font-size: 0.9rem;">${testimonial.name}</h4>
                        <p style="margin: 0; color: var(--neon-cyan); font-size: 0.75rem;">${testimonial.position || ''}</p>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.7rem;">${testimonial.company || ''}</p>
                    </div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.4; font-style: italic; margin: 0;">
                    "${testimonial.content}"
                </p>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div style="padding: 1rem; max-height: 300px; overflow-y: auto;">
                ${testimonialsHtml}
            </div>
        `;
    }
    
    populateStats() {
        const container = document.getElementById('stats-display-3d');
        if (!container) {
            console.warn('Stats container not found');
            return;
        }
        
        console.log(`Populating stats with ${this.statsData.length} metrics`);
        
        const statsHtml = this.statsData.map((stat, index) => `
            <div style="
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                transition: all 0.3s ease;
                animation: zoomIn ${0.1 * (index + 1)}s ease forwards;
                opacity: 0;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <div style="font-size: 2rem; font-weight: bold; color: var(--neon-cyan); margin-bottom: 0.5rem;">
                    ${stat.metric_value}
                </div>
                <div style="color: var(--text-primary); font-size: 0.9rem; margin-bottom: 0.25rem;">
                    ${stat.metric_label || stat.metric_name}
                </div>
                <div style="color: var(--text-secondary); font-size: 0.7rem;">
                    ${stat.metric_name}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; padding: 1rem;">
                ${statsHtml}
            </div>
        `;
    }
    
    populateSocialFeed() {
        const container = document.getElementById('social-feed-3d');
        if (!container) return;
        
        // Ensure container has proper height
        container.style.height = 'auto';
        container.style.minHeight = '350px';
        container.style.overflow = 'visible';
        
        container.innerHTML = `
            <div style="padding: 1rem; height: 100%;">
                <div style="
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                ">
                    <div>
                        <h4 style="margin: 0 0 1rem 0; color: var(--text-primary);">Connect with Kavya</h4>
                        <p style="margin: 0 0 1.5rem 0; font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">
                            Follow my journey in tech and innovation
                        </p>
                    </div>
                    
                    <!-- Instagram QR Code -->
                    <div style="margin: 1rem 0; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <img src="/static/assets/ig_qr_code.png" alt="Instagram QR Code" style="
                            width: 140px;
                            height: 140px;
                            border-radius: 12px;
                            border: 2px solid var(--neon-pink);
                            box-shadow: 0 0 20px rgba(255, 20, 147, 0.3);
                            object-fit: contain;
                            display: block;
                        " />
                        <p style="margin: 1rem 0 0 0; font-size: 0.85rem; color: var(--neon-pink); font-weight: bold;">
                            @kavyapatel_2119
                        </p>
                    </div>
                    
                    <!-- Social Links -->
                    <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;">
                        <a href="https://instagram.com/kavyapatel_2119" target="_blank" style="
                            color: var(--neon-pink);
                            font-size: 1.5rem;
                            transition: all 0.3s ease;
                            padding: 0.75rem;
                            border-radius: 10px;
                            background: rgba(255, 20, 147, 0.15);
                            text-decoration: none;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        " onmouseover="this.style.transform='scale(1.1)'; this.style.background='rgba(255, 20, 147, 0.25)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255, 20, 147, 0.15)'">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="#" style="
                            color: var(--neon-cyan);
                            font-size: 1.5rem;
                            transition: all 0.3s ease;
                            padding: 0.75rem;
                            border-radius: 10px;
                            background: rgba(0, 255, 255, 0.15);
                            text-decoration: none;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        " onmouseover="this.style.transform='scale(1.1)'; this.style.background='rgba(0, 255, 255, 0.25)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(0, 255, 255, 0.15)'">
                            <i class="fab fa-linkedin"></i>
                        </a>
                        <a href="#" style="
                            color: var(--neon-purple);
                            font-size: 1.5rem;
                            transition: all 0.3s ease;
                            padding: 0.75rem;
                            border-radius: 10px;
                            background: rgba(138, 43, 226, 0.15);
                            text-decoration: none;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        " onmouseover="this.style.transform='scale(1.1)'; this.style.background='rgba(138, 43, 226, 0.25)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(138, 43, 226, 0.15)'">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    populateChat() {
        const container = document.getElementById('chat-widget-3d');
        if (!container) return;
        
        container.innerHTML = `
            <div style="
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1rem;
                height: 300px;
                display: flex;
                flex-direction: column;
            ">
                <div style="flex: 1; overflow-y: auto; margin-bottom: 1rem;">
                    <div style="
                        background: var(--neon-cyan);
                        color: var(--primary-bg);
                        padding: 0.75rem;
                        border-radius: 12px;
                        margin-bottom: 1rem;
                        font-size: 0.9rem;
                    ">
                        Hello! How can I help you today?
                    </div>
                    <div style="
                        background: var(--surface-bg);
                        color: var(--text-primary);
                        padding: 0.75rem;
                        border-radius: 12px;
                        margin-left: 2rem;
                        font-size: 0.9rem;
                    ">
                        I'd love to learn more about your projects!
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" placeholder="Type your message..." style="
                        flex: 1;
                        background: var(--surface-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 8px;
                        padding: 0.75rem;
                        color: var(--text-primary);
                        font-size: 0.9rem;
                    " />
                    <button style="
                        background: var(--gradient-primary);
                        border: none;
                        border-radius: 8px;
                        padding: 0.75rem;
                        color: white;
                        cursor: pointer;
                    ">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Initialize fallback project gallery
     */
    initFallbackProjectGallery() {
        const container = document.getElementById('project-gallery-3d');
        if (!container) {
            console.warn('Project gallery container not found');
            return;
        }
        
        console.log(`Rendering ${this.projectsData.length} projects in gallery`);
        
        // Show projects even if empty array - use database data or display message
        if (!this.projectsData.length) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-code" style="font-size: 3rem; margin-bottom: 1rem; color: var(--neon-cyan);"></i>
                    <h3 style="margin: 0 0 1rem 0; color: var(--text-primary);">Projects Loading...</h3>
                    <p style="margin: 0;">Your portfolio projects will appear here.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            padding: 1rem;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        this.projectsData.forEach((project, index) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1.5rem;
                transition: all 0.3s ease;
                cursor: pointer;
                animation: fadeInUp ${0.1 * (index + 1)}s ease forwards;
                opacity: 0;
                transform: translateY(20px);
            `;
            
            const techStack = Array.isArray(project.tech_stack) ? project.tech_stack : 
                              JSON.parse(project.tech_stack || '[]');
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <img src="${project.image_url}" alt="${project.title}" style="width: 48px; height: 48px; border-radius: 8px;">
                    <div>
                        <h3 style="margin: 0; color: var(--text-primary); font-size: 1.1rem;">${project.title}</h3>
                        <span style="color: var(--neon-cyan); font-size: 0.85rem;">${project.category}</span>
                    </div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem;">
                    ${project.description.substring(0, 120)}...
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                    ${techStack.slice(0, 3).map(tech => 
                        `<span style="background: var(--neon-cyan); color: var(--primary-bg); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">${tech}</span>`
                    ).join('')}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="${project.github_url}" target="_blank" style="color: var(--neon-cyan); text-decoration: none; font-size: 0.9rem;">
                        <i class="fab fa-github"></i> Code
                    </a>
                    <a href="${project.live_url}" target="_blank" style="color: var(--neon-purple); text-decoration: none; font-size: 0.9rem;">
                        <i class="fas fa-external-link-alt"></i> Demo
                    </a>
                </div>
            `;
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 10px 30px rgba(0, 255, 255, 0.2)';
                card.style.borderColor = 'var(--neon-cyan)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'none';
                card.style.borderColor = 'var(--glass-border)';
            });
            
            grid.appendChild(card);
        });
        
        container.appendChild(grid);
    }
    
    /**
     * Initialize fallback skills display
     */
    initFallbackSkillsDisplay() {
        const container = document.getElementById('skills-sphere-3d');
        if (!container || !Object.keys(this.skillsData).length) return;
        
        container.innerHTML = '';
        const skillsGrid = document.createElement('div');
        skillsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 1rem;
            max-height: 300px;
            overflow-y: auto;
        `;
        
        Object.entries(this.skillsData).forEach(([category, skills]) => {
            const categoryCard = document.createElement('div');
            categoryCard.style.cssText = `
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1rem;
                transition: all 0.3s ease;
            `;
            
            categoryCard.innerHTML = `
                <h4 style="margin: 0 0 1rem 0; color: var(--neon-cyan); font-size: 1rem;">${category}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${skills.map(skill => `
                        <div style="
                            background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
                            color: white;
                            padding: 0.5rem;
                            border-radius: 8px;
                            font-size: 0.8rem;
                            font-weight: 500;
                            position: relative;
                            overflow: hidden;
                        ">
                            <span>${skill.name}</span>
                            <div style="
                                position: absolute;
                                bottom: 0;
                                left: 0;
                                height: 3px;
                                width: ${skill.proficiency}%;
                                background: rgba(255,255,255,0.8);
                                transition: width 0.3s ease;
                            "></div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            skillsGrid.appendChild(categoryCard);
        });
        
        container.appendChild(skillsGrid);
    }
    
    /**
     * Initialize fallback stats
     */
    initFallbackStats() {
        const container = document.getElementById('stats-visualization');
        if (!container) return;
        
        container.innerHTML = '';
        const stats = document.createElement('div');
        stats.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            padding: 1rem;
        `;
        
        const defaultStats = [
            { metric_name: 'Projects', metric_value: this.projectsData.length, metric_label: 'Completed Projects' },
            { metric_name: 'Skills', metric_value: Object.values(this.skillsData).flat().length, metric_label: 'Technologies' },
            { metric_name: 'Experience', metric_value: 5, metric_label: 'Years' },
            { metric_name: 'Clients', metric_value: 15, metric_label: 'Happy Clients' }
        ];
        
        const statsToShow = this.statsData.length ? this.statsData : defaultStats;
        
        statsToShow.forEach((stat, index) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                transition: all 0.3s ease;
                animation: bounceIn ${0.1 * (index + 1)}s ease forwards;
                opacity: 0;
                transform: scale(0.8);
            `;
            
            card.innerHTML = `
                <div style="
                    font-size: 2rem;
                    font-weight: bold;
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.5rem;
                ">${stat.metric_value}+</div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">${stat.metric_label}</p>
            `;
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.05)';
                card.style.borderColor = 'var(--neon-cyan)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
                card.style.borderColor = 'var(--glass-border)';
            });
            
            stats.appendChild(card);
        });
        
        container.appendChild(stats);
    }
    
    /**
     * Initialize fallback timeline
     */
    initFallbackTimeline() {
        const container = document.getElementById('timeline-3d');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Create sample timeline data if none exists
        const sampleTimeline = this.timelineData.length ? this.timelineData : [
            {
                title: 'Senior Full Stack Developer',
                company: 'Tech Innovation Labs',
                description: 'Lead development of scalable web applications using Python, React, and cloud technologies. Managed a team of 5 developers and delivered 15+ successful projects.',
                start_date: '2022-01-01',
                end_date: null,
                current: true,
                category: 'job'
            },
            {
                title: 'Software Engineer',
                company: 'Digital Solutions Inc',
                description: 'Developed enterprise applications with Flask, PostgreSQL, and modern JavaScript frameworks. Specialized in API development and database optimization.',
                start_date: '2020-06-01',
                end_date: '2021-12-31',
                current: false,
                category: 'job'
            },
            {
                title: 'Computer Science Degree',
                company: 'University of Technology',
                description: 'Bachelor of Science in Computer Science with focus on software engineering, algorithms, and database systems.',
                start_date: '2017-09-01',
                end_date: '2021-05-31',
                current: false,
                category: 'education'
            }
        ];
        
        const timeline = document.createElement('div');
        timeline.style.cssText = `
            padding: 1rem;
            max-height: 400px;
            overflow-y: auto;
            position: relative;
        `;
        
        timeline.innerHTML = `
            <div style="position: absolute; left: 2rem; top: 0; bottom: 0; width: 2px; background: var(--neon-cyan);"></div>
            ${sampleTimeline.map((item, index) => `
                <div style="
                    position: relative;
                    margin-left: 3rem;
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    animation: slideInRight ${0.2 * (index + 1)}s ease forwards;
                    opacity: 0;
                ">
                    <div style="
                        position: absolute;
                        left: -2.5rem;
                        top: 1rem;
                        width: 1rem;
                        height: 1rem;
                        background: ${item.current ? 'var(--neon-green)' : 'var(--neon-purple)'};
                        border-radius: 50%;
                        border: 3px solid var(--primary-bg);
                    "></div>
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${item.title}</h4>
                    <p style="margin: 0 0 0.5rem 0; color: var(--neon-cyan); font-size: 0.9rem;">${item.company}</p>
                    <p style="margin: 0 0 1rem 0; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4;">${item.description}</p>
                    <span style="color: var(--neon-purple); font-size: 0.8rem;">
                        ${new Date(item.start_date).getFullYear()} - ${item.current ? 'Present' : new Date(item.end_date).getFullYear()}
                    </span>
                </div>
            `).join('')}
        `;
        
        container.appendChild(timeline);
    }
    
    /**
     * Initialize fallback testimonials
     */
    initFallbackTestimonials() {
        const container = document.getElementById('testimonial-globe-3d');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Create sample testimonials if none exist
        const sampleTestimonials = this.testimonialsData.length ? this.testimonialsData : [
            {
                name: 'Sarah Johnson',
                company: 'TechCorp',
                position: 'CTO',
                content: 'Outstanding developer with exceptional problem-solving skills. Delivered our project ahead of schedule with incredible attention to detail.',
                avatar_url: '/static/assets/default-avatar.svg'
            },
            {
                name: 'Mike Chen',
                company: 'StartupXYZ',
                position: 'Founder',
                content: 'Kavya transformed our vision into reality. The technical expertise and creative solutions exceeded all expectations.',
                avatar_url: '/static/assets/default-avatar.svg'
            },
            {
                name: 'Dr. Emily Rodriguez',
                company: 'Research Institute',
                position: 'Director',
                content: 'Brilliant work on our data analysis platform. The AI integration was seamless and the results were phenomenal.',
                avatar_url: '/static/assets/default-avatar.svg'
            }
        ];
        
        const testimonials = document.createElement('div');
        testimonials.style.cssText = `
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
            max-height: 300px;
            overflow-y: auto;
        `;
        
        sampleTestimonials.forEach((testimonial, index) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1rem;
                transition: all 0.3s ease;
                animation: fadeIn ${0.15 * (index + 1)}s ease forwards;
                opacity: 0;
            `;
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: var(--gradient-primary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 1.2rem;
                    ">${testimonial.name.charAt(0)}</div>
                    <div>
                        <h4 style="margin: 0; color: var(--text-primary); font-size: 0.9rem;">${testimonial.name}</h4>
                        <p style="margin: 0; color: var(--neon-cyan); font-size: 0.75rem;">${testimonial.position}</p>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.7rem;">${testimonial.company}</p>
                    </div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.4; font-style: italic; margin: 0;">
                    "${testimonial.content}"
                </p>
            `;
            
            testimonials.appendChild(card);
        });
        
        container.appendChild(testimonials);
    }
    
    /**
     * Initialize fallback social feed
     */
    initFallbackSocialFeed() {
        const container = document.getElementById('social-feed-3d');
        if (!container) return;
        
        container.innerHTML = '';
        
        const socialFeed = document.createElement('div');
        socialFeed.style.cssText = `
            padding: 1rem;
            text-align: center;
            color: var(--text-secondary);
        `;
        
        socialFeed.innerHTML = `
            <div style="
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 2rem;
                transition: all 0.3s ease;
            ">
                <i class="fas fa-share-alt" style="font-size: 2rem; color: var(--neon-cyan); margin-bottom: 1rem;"></i>
                <h4 style="margin: 0 0 1rem 0; color: var(--text-primary);">Social Updates</h4>
                <p style="margin: 0; font-size: 0.9rem; line-height: 1.5;">
                    Connect with me on social media for the latest updates on projects, tech insights, and professional achievements.
                </p>
                <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;">
                    <a href="#" style="color: var(--neon-cyan); font-size: 1.5rem;"><i class="fab fa-linkedin"></i></a>
                    <a href="#" style="color: var(--neon-purple); font-size: 1.5rem;"><i class="fab fa-github"></i></a>
                    <a href="#" style="color: var(--neon-pink); font-size: 1.5rem;"><i class="fab fa-twitter"></i></a>
                </div>
            </div>
        `;
        
        container.appendChild(socialFeed);
    }
    
    /**
     * Initialize fallback chat
     */
    initFallbackChat() {
        const container = document.getElementById('chat-widget-3d');
        if (!container) return;
        
        container.innerHTML = '';
        
        const chat = document.createElement('div');
        chat.style.cssText = `
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 1rem;
            height: 300px;
            display: flex;
            flex-direction: column;
        `;
        
        chat.innerHTML = `
            <div style="flex: 1; overflow-y: auto; margin-bottom: 1rem;">
                <div style="
                    background: var(--neon-cyan);
                    color: var(--primary-bg);
                    padding: 0.75rem;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                ">
                    Hello! How can I help you today?
                </div>
                <div style="
                    background: var(--surface-bg);
                    color: var(--text-primary);
                    padding: 0.75rem;
                    border-radius: 12px;
                    margin-left: 2rem;
                    font-size: 0.9rem;
                ">
                    I'd love to learn more about your projects!
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" placeholder="Type your message..." style="
                    flex: 1;
                    background: var(--surface-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 8px;
                    padding: 0.75rem;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                " />
                <button style="
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: 8px;
                    padding: 0.75rem;
                    color: white;
                    cursor: pointer;
                ">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        container.appendChild(chat);
    }

    populateAchievements() {
        const container = document.getElementById('achievements-display-3d');
        if (!container) return;
        
        console.log('Populating achievements with', Object.keys(this.achievementsData).length, 'categories');
        
        if (Object.keys(this.achievementsData).length === 0) {
            container.innerHTML = `
                <div style="
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                ">
                    <i class="fas fa-trophy" style="font-size: 3rem; color: var(--neon-gold); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Achievements Loading...</h3>
                    <p style="color: var(--text-secondary);">Professional development and competition achievements will appear here.</p>
                </div>
            `;
            return;
        }
        
        let achievementsHtml = '';
        
        Object.entries(this.achievementsData).forEach(([category, achievements]) => {
            const categoryIcon = category === 'Professional Development' ? 'fas fa-graduation-cap' : 'fas fa-gamepad';
            
            achievementsHtml += `
                <div class="achievement-category" data-category="${category}">
                    <h3 class="achievement-category-title">
                        <i class="${categoryIcon}"></i>
                        ${category}
                    </h3>
                    ${achievements.map((achievement, index) => `
                        <div class="achievement-card" data-category="${category}" style="animation-delay: ${index * 0.1}s;">
                            <div class="achievement-badge badge-${achievement.badge_color}"></div>
                            <div class="achievement-header">
                                <div class="achievement-icon">
                                    <i class="${achievement.icon}"></i>
                                </div>
                                <div class="achievement-info">
                                    <h4 class="achievement-title">${achievement.title}</h4>
                                    <p class="achievement-organization">${achievement.organization || ''}</p>
                                    <p class="achievement-date">${achievement.date_achieved ? new Date(achievement.date_achieved).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : ''}</p>
                                </div>
                            </div>
                            <p class="achievement-description">${achievement.description || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        });
        
        container.innerHTML = achievementsHtml;
        
        // Initialize filter functionality
        this.initAchievementFilters();
    }
    
    initAchievementFilters() {
        const filters = document.querySelectorAll('.achievement-filter');
        const cards = document.querySelectorAll('.achievement-card');
        const categories = document.querySelectorAll('.achievement-category');
        
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterValue = filter.getAttribute('data-filter');
                
                // Update active filter
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                // Filter achievements
                if (filterValue === 'all') {
                    categories.forEach(category => {
                        category.style.display = 'block';
                    });
                    cards.forEach(card => {
                        card.style.display = 'block';
                    });
                } else {
                    categories.forEach(category => {
                        const categoryName = category.getAttribute('data-category');
                        if (categoryName === filterValue) {
                            category.style.display = 'block';
                        } else {
                            category.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

    /**
     * Show data loading error
     */
    showDataError() {
        console.warn('Some dashboard data failed to load, using fallback');
        // Force immediate fallback widget initialization
        this.initializeFallbackWidgets();
    }
    
    /**
     * Cleanup
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.renderers.forEach(renderer => {
            renderer.dispose();
        });
        
        this.scenes.forEach(scene => {
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        });
    }
    
    // Additional widget implementations would continue here...
    // (Stats Visualizer 3D, World Map 3D, Social Feed 3D, etc.)
    // Due to length constraints, these follow similar patterns
}

// Add CSS animations for fallback dashboard
const fallbackStyles = document.createElement('style');
fallbackStyles.textContent = `
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        to {
            opacity: 1;
        }
    }
    
    @keyframes bounceIn {
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .fallback-project-grid::-webkit-scrollbar,
    .fallback-skills-grid::-webkit-scrollbar {
        width: 8px;
    }
    
    .fallback-project-grid::-webkit-scrollbar-track,
    .fallback-skills-grid::-webkit-scrollbar-track {
        background: var(--glass-bg);
        border-radius: 4px;
    }
    
    .fallback-project-grid::-webkit-scrollbar-thumb,
    .fallback-skills-grid::-webkit-scrollbar-thumb {
        background: var(--neon-cyan);
        border-radius: 4px;
    }
`;
document.head.appendChild(fallbackStyles);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('dashboard-body')) {
        const dashboard = new Dashboard3D();
        window.dashboard3D = dashboard; // For debugging
    }
});
