// Main Application Entry Point
import { CONFIG, Utils, ErrorHandler } from './config.js';
import { LoadingScreen } from '../components/LoadingScreen.js';
import { Navigation } from '../components/Navigation.js';
import { CNNVisualization } from '../components/CNNVisualization.js';
import { CNNAnimation } from '../components/CNNAnimation.js';
import { StepNavigation } from '../components/StepNavigation.js';
import { InteractiveDemo } from '../components/InteractiveDemo.js';
import { Utilities } from '../components/Utilities.js';

class CNNExplorerApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) {
            console.warn('App already initialized');
            return;
        }

        try {
            console.log('Initializing CNN Explorer App...');
            
            // Initialize loading screen first
            this.components.loadingScreen = new LoadingScreen();
            await this.components.loadingScreen.init();

            // Wait for DOM to be fully ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core components
            await this.initializeComponents();

            // Setup global event handlers
            this.setupGlobalHandlers();

            // Hide loading screen after initialization
            setTimeout(async () => {
                await this.components.loadingScreen.hide();
            }, CONFIG.LOADING_DURATION);

            this.isInitialized = true;
            console.log('CNN Explorer App initialized successfully');

        } catch (error) {
            ErrorHandler.handle(error, 'CNNExplorerApp.init');
            
            // Ensure loading screen is hidden even if there's an error
            setTimeout(async () => {
                if (this.components.loadingScreen) {
                    await this.components.loadingScreen.hide();
                }
            }, CONFIG.LOADING_DURATION);
        }
    }

    async initializeComponents() {
        console.log('Initializing components...');

        // Initialize navigation
        this.components.navigation = new Navigation();
        await this.components.navigation.init();

        // Initialize CNN Animation (THREE.js landing animation) - delay to match original timing
        setTimeout(() => {
            try {
                this.components.cnnAnimation = new CNNAnimation();
            } catch (error) {
                console.error('Error initializing CNNAnimation:', error);
            }
        }, 1500);

        // Initialize CNN visualization
        this.components.visualization = new CNNVisualization();
        await this.components.visualization.init();

        // Initialize step navigation
        this.components.stepNavigation = new StepNavigation(this.components.visualization);
        await this.components.stepNavigation.init();

        // Initialize interactive demo
        this.components.interactiveDemo = new InteractiveDemo();
        await this.components.interactiveDemo.init();

        // Initialize utilities
        Utilities.init();

        // Setup scroll animations
        this.setupScrollAnimations();
        
        // Setup enhanced interactions
        this.setupEnhancedInteractions();

        // Setup hero animations (matching original script-clean.js)
        this.setupHeroAnimations();

        console.log('All components initialized');
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.section-title, .section-subtitle, .intro-text, .intro-visual, .app-card, .step-content, .demo-container').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    setupEnhancedInteractions() {
        // Enhanced button interactions
        document.querySelectorAll('.btn').forEach(btn => {
            Utils.safeAddEventListener(btn, 'mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            
            Utils.safeAddEventListener(btn, 'mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });

        // Canvas hover effects
        document.querySelectorAll('canvas').forEach(canvas => {
            Utils.safeAddEventListener(canvas, 'mouseenter', () => {
                canvas.style.transform = 'scale(1.02)';
            });
            
            Utils.safeAddEventListener(canvas, 'mouseleave', () => {
                canvas.style.transform = 'scale(1)';
            });
        });
    }

    setupHeroAnimations() {
        // Smooth reveal animations for hero content (from original script-clean.js)
        setTimeout(() => {
            const heroTitle = document.querySelector('.hero-title');
            const heroDesc = document.querySelector('.hero-description');
            const heroBtn = document.querySelector('.hero-buttons');
            
            if (heroTitle) heroTitle.style.animation = 'fadeInUp 1s ease forwards';
            if (heroDesc) heroDesc.style.animation = 'fadeInUp 1s ease 0.3s forwards';
            if (heroBtn) heroBtn.style.animation = 'fadeInUp 1s ease 0.6s forwards';
        }, 1500);
    }

    setupGlobalHandlers() {
        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Handle visibility change (for pausing animations when tab is not active)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Navbar scroll effect (from original script-clean.js)
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        // Handle errors globally
        window.addEventListener('error', (event) => {
            ErrorHandler.handle(event.error, 'Global Error');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            ErrorHandler.handle(event.reason, 'Unhandled Promise Rejection');
        });
    }

    handleWindowResize() {
        try {
            // Reinitialize canvases that might need resizing
            if (this.components.visualization && this.components.visualization.isInitialized) {
                this.components.visualization.setupInputCanvas();
            }

            if (this.components.interactiveDemo && this.components.interactiveDemo.isInitialized) {
                // The interactive demo might need to adjust canvas sizes
                console.log('Window resized - interactive demo might need adjustments');
            }

        } catch (error) {
            ErrorHandler.handle(error, 'handleWindowResize');
        }
    }

    handleVisibilityChange() {
        try {
            if (document.hidden) {
                // Page is hidden - could pause animations or reduce activity
                console.log('Page hidden - reducing activity');
            } else {
                // Page is visible again - could resume animations
                console.log('Page visible - resuming normal activity');
            }
        } catch (error) {
            ErrorHandler.handle(error, 'handleVisibilityChange');
        }
    }

    // Public API methods
    getComponent(name) {
        return this.components[name] || null;
    }

    // Restart the app (useful for development)
    async restart() {
        console.log('Restarting app...');
        
        // Reset initialization flag
        this.isInitialized = false;
        
        // Clear components
        this.components = {};
        
        // Reinitialize
        await this.init();
    }
}

// 3D Animation Class (optional, separated for modularity)
class CNNAnimation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.container = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized || !window.THREE) {
            return; // Skip if Three.js is not loaded or already initialized
        }

        try {
            this.container = Utils.safeQuerySelector('#cnn-animation-container');
            if (!this.container) {
                console.warn('3D animation container not found');
                return;
            }

            this.setupThreeJS();
            this.createScene();
            this.startAnimation();
            
            this.isInitialized = true;
            console.log('3D Animation initialized successfully');
            
        } catch (error) {
            ErrorHandler.handle(error, 'CNNAnimation.init');
        }
    }

    setupThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // Add to container
        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {
        // Create a simple neural network visualization
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x0066ff });
        
        // Create nodes
        for (let layer = 0; layer < 3; layer++) {
            const nodeCount = layer === 1 ? 4 : 3;
            for (let node = 0; node < nodeCount; node++) {
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.x = layer * 2 - 2;
                sphere.position.y = (node - nodeCount/2) * 0.5;
                sphere.position.z = 0;
                this.scene.add(sphere);
            }
        }
        
        // Position camera
        this.camera.position.z = 5;
    }

    startAnimation() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotate the scene slightly
            this.scene.rotation.y += 0.005;
            
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
}

// Initialize the application
const app = new CNNExplorerApp();

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await app.init();
    
    // Optionally initialize 3D animation
    try {
        const animation = new CNNAnimation();
        await animation.init();
    } catch (error) {
        console.log('3D animation not available:', error.message);
    }
});

// Export for potential external use
window.CNNExplorerApp = app;
export default app;
