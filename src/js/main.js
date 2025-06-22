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


// Initialize the application
const app = new CNNExplorerApp();

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await app.init();
    
    // 3D animation is initialized within the app
});

// Export for potential external use
window.CNNExplorerApp = app;
export default app;
