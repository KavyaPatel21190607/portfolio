// ===== MAIN APPLICATION CONTROLLER =====

class PortfolioApp {
    constructor() {
        this.isLoading = true;
        this.currentTheme = 'dark';
        this.scrollProgress = 0;
        this.activeSection = 'hero';
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize loading screen
            this.initLoading();
            
            // Initialize navigation
            this.initNavigation();
            
            // Initialize theme toggle
            this.initThemeToggle();
            
            // Initialize scroll handling
            this.initScrollHandling();
            
            // Initialize 3D renderer
            try {
                this.renderer3D = new Renderer3D();
                await this.renderer3D.init();
            } catch (error) {
                console.warn('3D renderer initialization failed, continuing without 3D effects:', error);
                this.renderer3D = null;
            }
            
            // Initialize particles
            try {
                this.particles = new ParticleSystem();
                this.particles.init();
            } catch (error) {
                console.warn('Particle system initialization failed, continuing without particles:', error);
                this.particles = null;
            }
            
            // Initialize API client
            this.api = new APIClient();
            
            // Load content
            await this.loadContent();
            
            // Initialize interactions
            this.initInteractions();
            
            // Hide loading screen
            this.hideLoading();
            
            console.log('Portfolio app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize portfolio app:', error);
            this.showError('Failed to load application');
        }
    }
    
    initLoading() {
        const progressBar = document.getElementById('progress-bar');
        let progress = 0;
        
        const updateProgress = () => {
            progress += Math.random() * 15;
            if (progress > 95) progress = 95;
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (progress < 95) {
                setTimeout(updateProgress, 100 + Math.random() * 200);
            }
        };
        
        updateProgress();
    }
    
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('progress-bar');
        
        if (progressBar) {
            progressBar.style.width = '100%';
        }
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = 'visible';
            }
            this.isLoading = false;
        }, 500);
    }
    
    initNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
        
        // Smooth scroll navigation
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-section');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Close mobile menu
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
            });
        });
        
        // Initialize nav logo 3D
        this.initNavLogo();
    }
    
    initNavLogo() {
        const logoContainer = document.getElementById('nav-logo-3d');
        if (!logoContainer) return;
        
        try {
            // Create a small 3D logo
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            
            renderer.setSize(40, 40);
            renderer.setClearColor(0x000000, 0);
            logoContainer.appendChild(renderer.domElement);
            
            // Create logo geometry
            const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });
            const cube = new THREE.Mesh(geometry, material);
            
            scene.add(cube);
            camera.position.z = 2;
            
            // Animation loop
            const animate = () => {
                requestAnimationFrame(animate);
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
                renderer.render(scene, camera);
            };
            animate();
        } catch (error) {
            console.warn('Nav logo 3D initialization failed:', error);
            // Fallback to simple CSS animation
            logoContainer.innerHTML = '<div style="width: 40px; height: 40px; background: linear-gradient(45deg, #00ffff, #8b5cf6); border-radius: 8px; animation: spin 2s linear infinite;"></div>';
        }
    }
    
    initScrollHandling() {
        let ticking = false;
        
        const updateScroll = () => {
            this.scrollProgress = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
            this.updateActiveSection();
            this.updateNavigationState();
            
            // Update particles based on scroll
            if (this.particles && this.particles.updateScroll) {
                this.particles.updateScroll(this.scrollProgress);
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        });
        
        // Intersection Observer for section detection
        this.initSectionObserver();
    }
    
    initSectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeSection = entry.target.id;
                    
                    // Update navigation
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === this.activeSection) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-20% 0px -20% 0px'
        });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + window.innerHeight / 2;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.activeSection = section.id;
            }
        });
    }
    
    updateNavigationState() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        
        if (window.pageYOffset > 100) {
            nav.style.background = 'rgba(26, 26, 46, 0.95)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.05)';
        }
    }
    
    async loadContent() {
        try {
            console.log('Starting content loading...');
            
            // Load projects
            await this.loadProjects();
            console.log('Projects loaded successfully');
            
            // Load achievements with immediate fix
            await this.loadAndRenderAchievements();
            console.log('Achievements loaded successfully');
            
            // Initialize contact form
            this.initContactForm();
            
            // Initialize project filters
            this.initProjectFilters();
            
            // Initialize achievement filters
            this.initAchievementFilters();
            
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }
    
    async loadAndRenderAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;
        
        // Immediately render achievements with static data to avoid loading issues
        const achievementsHTML = `
            <div class="achievement-item" data-category="Professional Development">
                <div class="achievement-badge badge-neon-red"></div>
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fas fa-server"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Getting Started with Linux Fundamentals (RH104)</h4>
                        <p class="achievement-organization">Red Hat</p>
                        <p class="achievement-date">January 2024</p>
                    </div>
                </div>
                <p class="achievement-description">Completed foundational Linux system administration training</p>
            </div>
            <div class="achievement-item" data-category="Professional Development">
                <div class="achievement-badge badge-neon-orange"></div>
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fab fa-linux"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Introduction to Linux (LFS101)</h4>
                        <p class="achievement-organization">Linux Foundation</p>
                        <p class="achievement-date">February 2024</p>
                    </div>
                </div>
                <p class="achievement-description">Comprehensive introduction to Linux operating system fundamentals</p>
            </div>
            <div class="achievement-item" data-category="Professional Development">
                <div class="achievement-badge badge-neon-red"></div>
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fas fa-cogs"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Red Hat System Administration I (RH124)</h4>
                        <p class="achievement-organization">Red Hat</p>
                        <p class="achievement-date">March 2024</p>
                    </div>
                </div>
                <p class="achievement-description">Advanced system administration and enterprise Linux management</p>
            </div>
            <div class="achievement-item" data-category="Professional Development">
                <div class="achievement-badge badge-neon-purple"></div>
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Certified AI Prompt Engineer - Be10x (Beginner)</h4>
                        <p class="achievement-organization">Be10x</p>
                        <p class="achievement-date">June 2024</p>
                    </div>
                </div>
                <p class="achievement-description">Specialized training in AI prompt engineering and optimization techniques</p>
            </div>
            <div class="achievement-item" data-category="Competitions & Hackathons">
                <div class="achievement-badge badge-neon-green"></div>
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fas fa-code"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Code-a-thon at Karnavati University</h4>
                        <p class="achievement-organization">Karnavati University</p>
                        <p class="achievement-date">September 2024</p>
                    </div>
                </div>
                <p class="achievement-description">Intensive coding competition focused on algorithmic problem solving and software development</p>
            </div>
            <div class="achievement-item" data-category="Competitions & Hackathons">
                <div class="achievement-badge badge-neon-yellow"></div>
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Pitch-a-thon at Karnavati University</h4>
                        <p class="achievement-organization">Karnavati University</p>
                        <p class="achievement-date">October 2024</p>
                    </div>
                </div>
                <p class="achievement-description">Competed in innovative pitch competition showcasing entrepreneurial solutions</p>
            </div>
            <div class="achievement-item" data-category="Competitions & Hackathons">
                <div class="achievement-badge badge-neon-gold"></div>
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Ariro 3.0 Technical Symposium - Code-a-thon</h4>
                        <p class="achievement-organization">Ariro Technical Symposium</p>
                        <p class="achievement-date">November 2024</p>
                    </div>
                </div>
                <p class="achievement-description">Advanced technical coding competition as part of prestigious technology symposium</p>
            </div>
            <div class="achievement-item" data-category="Competitions & Hackathons">
                <div class="achievement-badge badge-neon-cyan"></div>
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fas fa-gamepad"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Global Game Jam 2025</h4>
                        <p class="achievement-organization">Global Game Jam</p>
                        <p class="achievement-date">January 2025</p>
                    </div>
                </div>
                <p class="achievement-description">Participated in the world's largest game development event, creating innovative games in 48 hours</p>
            </div>
        `;
        
        achievementsGrid.innerHTML = achievementsHTML;
        this.animateAchievementCards();
    }
    
    async loadProjects() {
        try {
            const projects = await this.api.getProjects();
            this.renderProjects(projects);
        } catch (error) {
            console.error('Failed to load projects:', error);
            this.showProjectsError();
        }
    }
    
    renderProjects(projects) {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = '';
        
        projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            projectsGrid.appendChild(projectCard);
        });
        
        // Animate project cards
        this.animateProjectCards();
    }
    
    async loadAchievements() {
        try {
            console.log('Loading achievements...');
            const achievements = await this.api.request('/api/achievements');
            console.log('Achievements loaded:', achievements);
            console.log('Data type:', typeof achievements);
            console.log('Object keys:', Object.keys(achievements));
            this.renderAchievements(achievements);
        } catch (error) {
            console.error('Failed to load achievements:', error);
            this.showAchievementsError();
        }
    }
    
    renderAchievements(achievementsData) {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) {
            console.error('Achievements grid not found!');
            return;
        }
        
        console.log('Starting achievements rendering...');
        achievementsGrid.innerHTML = '';
        
        // Check if we have valid achievements data
        if (!achievementsData || typeof achievementsData !== 'object' || Object.keys(achievementsData).length === 0) {
            console.log('No achievements data found');
            achievementsGrid.innerHTML = `
                <div class="achievement-item">
                    <div class="achievement-header">
                        <div class="achievement-icon-wrapper">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="achievement-info">
                            <h4 class="achievement-title">No Achievements Found</h4>
                            <p class="achievement-organization">Professional development and competition accomplishments will appear here</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        console.log('Processing achievements data...');
        console.log('Data structure:', achievementsData);
        
        // Check if any category has achievements
        const hasAchievements = Object.values(achievementsData).some(achievements => 
            Array.isArray(achievements) && achievements.length > 0
        );
        
        console.log('Has achievements:', hasAchievements);
        
        if (!hasAchievements) {
            console.log('No achievements in categories');
            achievementsGrid.innerHTML = `
                <div class="achievement-item">
                    <div class="achievement-header">
                        <div class="achievement-icon-wrapper">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="achievement-info">
                            <h4 class="achievement-title">No Achievements Found</h4>
                            <p class="achievement-organization">Professional development and competition accomplishments will appear here</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        let allAchievements = [];
        console.log('Building achievements array...');
        
        Object.entries(achievementsData).forEach(([category, achievements]) => {
            console.log(`Processing category: ${category}, achievements:`, achievements);
            achievements.forEach(achievement => {
                achievement.category = category;
                allAchievements.push(achievement);
            });
        });
        
        console.log(`Total achievements to render: ${allAchievements.length}`);
        
        allAchievements.forEach((achievement, index) => {
            console.log(`Creating card for achievement ${index + 1}:`, achievement.title);
            const achievementCard = this.createAchievementCard(achievement, index);
            achievementsGrid.appendChild(achievementCard);
        });
        
        console.log('Achievements rendering completed');
        
        // Animate achievement cards
        this.animateAchievementCards();
    }
    
    createAchievementCard(achievement, index) {
        const card = document.createElement('div');
        card.className = 'achievement-item';
        card.setAttribute('data-category', achievement.category);
        card.style.animationDelay = `${index * 0.1}s`;
        
        const dateString = achievement.date_achieved ? 
            new Date(achievement.date_achieved).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
            }) : '';
        
        card.innerHTML = `
            <div class="achievement-badge badge-${achievement.badge_color}"></div>
            <div class="achievement-header">
                <div class="achievement-icon-wrapper">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4 class="achievement-title">${achievement.title}</h4>
                    ${achievement.organization ? `<p class="achievement-organization">${achievement.organization}</p>` : ''}
                    ${dateString ? `<p class="achievement-date">${dateString}</p>` : ''}
                </div>
            </div>
            ${achievement.description ? `<p class="achievement-description">${achievement.description}</p>` : ''}
        `;
        
        return card;
    }
    
    animateAchievementCards() {
        const cards = document.querySelectorAll('.achievement-item');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) rotateX(0deg)';
            }, index * 100);
        });
    }
    
    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.setAttribute('data-category', project.category);
        
        card.innerHTML = `
            <div class="project-image">
                ${project.image_url ? 
                    `<img src="${project.image_url}" alt="${project.title}" loading="lazy">` : 
                    ''
                }
            </div>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                ${project.tech_stack.map(tech => 
                    `<span class="tech-tag">${tech}</span>`
                ).join('')}
            </div>
            <div class="project-links">
                ${project.github_url ? 
                    `<a href="${project.github_url}" class="project-link" target="_blank" rel="noopener">
                        <i class="fab fa-github"></i>
                        <span>Code</span>
                    </a>` : ''
                }
                ${project.live_url ? 
                    `<a href="${project.live_url}" class="project-link" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt"></i>
                        <span>Live Demo</span>
                    </a>` : ''
                }
            </div>
        `;
        
        return card;
    }
    
    animateProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });
        
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    
    initProjectFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active filter
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter projects
                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px) scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
    
    initAchievementFilters() {
        const filterButtons = document.querySelectorAll('.achievement-filter-btn');
        const achievementCards = document.querySelectorAll('.achievement-item');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterValue = button.getAttribute('data-filter');
                
                // Update active filter
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter achievements
                achievementCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    
                    if (filterValue === 'all' || cardCategory === filterValue) {
                        card.style.display = 'block';
                        card.style.animation = 'achievementSlideIn 0.5s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    showAchievementsError() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;
        
        achievementsGrid.innerHTML = `
            <div class="achievement-item">
                <div class="achievement-header">
                    <div class="achievement-icon-wrapper">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="achievement-info">
                        <h4 class="achievement-title">Unable to load achievements</h4>
                        <p class="achievement-organization">Please check your connection and try again</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    initContactForm() {
        const contactForm = document.getElementById('contact-form');
        const feedback = document.getElementById('contact-feedback');
        
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            try {
                // Show loading state
                const submitBtn = contactForm.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                const response = await this.api.submitContact(data);
                
                if (response.success) {
                    this.showContactSuccess(response.message);
                    contactForm.reset();
                } else {
                    throw new Error(response.error || 'Failed to send message');
                }
                
            } catch (error) {
                console.error('Contact form error:', error);
                this.showContactError(error.message || 'Failed to send message');
            } finally {
                // Reset button
                const submitBtn = contactForm.querySelector('.submit-btn');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    showContactSuccess(message) {
        const feedback = document.getElementById('contact-feedback');
        if (!feedback) return;
        
        feedback.className = 'contact-feedback success';
        feedback.textContent = message;
        feedback.style.opacity = '1';
        feedback.style.transform = 'translateY(0) scale(1)';
        
        // Add confetti effect
        this.createConfettiEffect();
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-10px) scale(0.9)';
        }, 5000);
    }
    
    showContactError(message) {
        const feedback = document.getElementById('contact-feedback');
        if (!feedback) return;
        
        feedback.className = 'contact-feedback error';
        feedback.textContent = message;
        feedback.style.opacity = '1';
        feedback.style.transform = 'translateY(0) scale(1)';
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-10px) scale(0.9)';
        }, 5000);
    }
    
    createConfettiEffect() {
        const colors = ['#00ffff', '#8b5cf6', '#ffd700', '#ff00ff'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100vw';
        confettiContainer.style.height = '100vh';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
            
            confettiContainer.appendChild(confetti);
        }
        
        document.body.appendChild(confettiContainer);
        
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 5000);
    }
    
    initInteractions() {
        // Initialize hero interactions
        this.initHeroInteractions();
        
        // Initialize about section interactions
        this.initAboutInteractions();
        
        // Add general hover effects
        this.initHoverEffects();
    }
    
    initHeroInteractions() {
        const heroSection = document.getElementById('hero');
        if (!heroSection) return;
        
        // Mouse parallax effect
        heroSection.addEventListener('mousemove', (e) => {
            if (this.isLoading) return;
            
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            const heroText = heroSection.querySelector('.hero-text');
            const hero3D = heroSection.querySelector('.hero-3d-container');
            
            if (heroText) {
                heroText.style.transform = `translateX(${x * 20}px) translateY(${y * 10}px)`;
            }
            
            if (hero3D) {
                hero3D.style.transform = `translateX(${x * -30}px) translateY(${y * -15}px) rotateY(${x * 10}deg) rotateX(${y * -5}deg)`;
            }
        });
        
        heroSection.addEventListener('mouseleave', () => {
            const heroText = heroSection.querySelector('.hero-text');
            const hero3D = heroSection.querySelector('.hero-3d-container');
            
            if (heroText) {
                heroText.style.transform = 'translateX(0) translateY(0)';
            }
            
            if (hero3D) {
                hero3D.style.transform = 'translateX(0) translateY(0) rotateY(0) rotateX(0)';
            }
        });
    }
    
    initAboutInteractions() {
        const statItems = document.querySelectorAll('.stat-3d');
        
        statItems.forEach(stat => {
            stat.addEventListener('mouseenter', () => {
                stat.style.transform = 'rotateY(180deg) scale(1.1)';
            });
            
            stat.addEventListener('mouseleave', () => {
                stat.style.transform = 'rotateY(0deg) scale(1)';
            });
        });
    }
    
    initHoverEffects() {
        // Add 3D hover effects to buttons
        const buttons3D = document.querySelectorAll('.btn-3d');
        
        buttons3D.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-4px) rotateX(10deg) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
            });
        });
    }
    
    showProjectsError() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff0000; margin-bottom: 1rem;"></i>
                <h3>Failed to load projects</h3>
                <p>Please try refreshing the page or contact support if the problem persists.</p>
            </div>
        `;
    }
    
    showError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-notification';
        errorContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            border-radius: 8px;
            padding: 1rem;
            color: #ff0000;
            z-index: 10000;
            max-width: 300px;
        `;
        errorContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorContainer);
        
        setTimeout(() => {
            if (document.body.contains(errorContainer)) {
                document.body.removeChild(errorContainer);
            }
        }, 5000);
    }
    
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        if (!themeToggle || !themeIcon) return;
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
        this.applyTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'neon-light' : 'dark';
            
            this.applyTheme(newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
            
            // Add visual feedback
            themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    applyTheme(theme) {
        const themeIcon = document.getElementById('theme-icon');
        const body = document.body;
        
        if (theme === 'neon-light') {
            document.documentElement.setAttribute('data-theme', 'neon-light');
            body.classList.add('neon-light-theme');
            if (themeIcon) {
                themeIcon.className = 'fas fa-moon';
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            body.classList.remove('neon-light-theme');
            if (themeIcon) {
                themeIcon.className = 'fas fa-sun';
            }
        }
        
        // Trigger theme change event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
}

// ===== CONFETTI ANIMATION =====
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(720deg);
        }
    }
`;
document.head.appendChild(style);

// ===== INITIALIZE APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    
    // Make app globally accessible for debugging
    window.portfolioApp = app;
});

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Portfolio loaded in ${loadTime}ms`);
        
        if (loadTime > 3000) {
            console.warn('Portfolio load time is above recommended 3 seconds');
        }
    });
}
