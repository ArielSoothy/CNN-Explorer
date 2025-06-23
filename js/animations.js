// CNNVision - Animation Controllers

class AnimationController {
    constructor() {
        this.activeAnimations = new Map();
        this.intersectionObserver = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.bindScrollAnimations();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: [0.1, 0.5, 0.9],
            rootMargin: '0px 0px -10% 0px'
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const animationType = element.dataset.animation;
                
                if (entry.isIntersecting) {
                    this.triggerAnimation(element, animationType);
                } else {
                    this.pauseAnimation(element, animationType);
                }
            });
        }, options);
    }

    bindScrollAnimations() {
        // Observe all elements with animation data attributes
        document.querySelectorAll('[data-animation]').forEach(element => {
            this.intersectionObserver.observe(element);
        });

        // Add scroll-based parallax effects
        window.addEventListener('scroll', this.throttle(() => {
            this.updateParallaxEffects();
        }, 16));
    }

    triggerAnimation(element, animationType) {
        switch (animationType) {
            case 'fadeInUp':
                this.fadeInUp(element);
                break;
            case 'slideInLeft':
                this.slideInLeft(element);
                break;
            case 'slideInRight':
                this.slideInRight(element);
                break;
            case 'scaleIn':
                this.scaleIn(element);
                break;
            case 'rotateIn':
                this.rotateIn(element);
                break;
            case 'typewriter':
                this.typewriterEffect(element);
                break;
            default:
                this.defaultFadeIn(element);
        }
    }

    pauseAnimation(element, animationType) {
        // For scroll-out animations, we typically don't reverse
        // unless specifically needed for the design
        if (element.dataset.reverseOnExit === 'true') {
            this.reverseAnimation(element, animationType);
        }
    }

    fadeInUp(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    slideInLeft(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-50px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }

    slideInRight(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(50px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }

    scaleIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    }

    rotateIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'rotate(-10deg) scale(0.8)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'rotate(0deg) scale(1)';
        });
    }

    typewriterEffect(element) {
        const text = element.textContent;
        const speed = parseInt(element.dataset.typewriterSpeed) || 50;
        
        element.textContent = '';
        element.style.opacity = '1';
        
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
        
        this.activeAnimations.set(element, typeInterval);
    }

    defaultFadeIn(element) {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.6s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    reverseAnimation(element, animationType) {
        switch (animationType) {
            case 'fadeInUp':
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                break;
            case 'slideInLeft':
                element.style.opacity = '0';
                element.style.transform = 'translateX(-50px)';
                break;
            case 'slideInRight':
                element.style.opacity = '0';
                element.style.transform = 'translateX(50px)';
                break;
            case 'scaleIn':
                element.style.opacity = '0';
                element.style.transform = 'scale(0.8)';
                break;
            default:
                element.style.opacity = '0';
        }
    }

    updateParallaxEffects() {
        const scrollY = window.pageYOffset;
        
        // Hero section parallax
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            const heroOffset = scrollY * 0.3;
            heroSection.style.transform = `translateY(${heroOffset}px)`;
        }

        // 3D container subtle movement
        const cnn3DContainer = document.querySelector('.cnn-3d-container');
        if (cnn3DContainer) {
            const containerOffset = scrollY * 0.1;
            cnn3DContainer.style.transform = `translateY(${containerOffset}px)`;
        }

        // Concept cards stagger effect
        const conceptCards = document.querySelectorAll('.concept-card');
        conceptCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.top + cardRect.height / 2;
            const windowCenter = window.innerHeight / 2;
            const distance = cardCenter - windowCenter;
            const parallaxValue = distance * 0.05;
            
            card.style.transform = `translateY(${parallaxValue}px)`;
        });
    }

    // Concept-specific animations for Phase 2
    setupConceptAnimations() {
        this.setupConvolutionAnimation();
        this.setupPoolingAnimation();
        this.setupFeatureDetectionAnimation();
        this.setupTrainingAnimation();
    }

    setupConvolutionAnimation() {
        // Will be implemented in Phase 2
        console.log('Convolution animation setup placeholder');
    }

    setupPoolingAnimation() {
        // Will be implemented in Phase 2
        console.log('Pooling animation setup placeholder');
    }

    setupFeatureDetectionAnimation() {
        // Will be implemented in Phase 2
        console.log('Feature detection animation setup placeholder');
    }

    setupTrainingAnimation() {
        // Will be implemented in Phase 2
        console.log('Training animation setup placeholder');
    }

    // Interactive animation controls
    createPlayPauseController(element, animationFunction) {
        const controller = document.createElement('div');
        controller.className = 'animation-controller';
        controller.innerHTML = `
            <button class="animation-play-btn" data-state="paused">
                <svg class="play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
                <svg class="pause-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display: none;">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            </button>
            <button class="animation-reset-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 4v6h6"></path>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
            </button>
        `;

        const playBtn = controller.querySelector('.animation-play-btn');
        const resetBtn = controller.querySelector('.animation-reset-btn');
        const playIcon = controller.querySelector('.play-icon');
        const pauseIcon = controller.querySelector('.pause-icon');

        let isPlaying = false;
        let animationInterval = null;

        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                // Pause
                clearInterval(animationInterval);
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                playBtn.dataset.state = 'paused';
                isPlaying = false;
            } else {
                // Play
                animationInterval = animationFunction(element);
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                playBtn.dataset.state = 'playing';
                isPlaying = true;
            }
        });

        resetBtn.addEventListener('click', () => {
            clearInterval(animationInterval);
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            playBtn.dataset.state = 'paused';
            isPlaying = false;
            // Reset animation to initial state
            this.resetElementAnimation(element);
        });

        return controller;
    }

    resetElementAnimation(element) {
        // Reset any transforms or styles applied by animations
        element.style.transform = '';
        element.style.opacity = '';
        element.style.transition = '';
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Performance monitoring
    measureAnimationPerformance(animationName, callback) {
        const startTime = performance.now();
        
        callback();
        
        requestAnimationFrame(() => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`Animation "${animationName}" took ${duration.toFixed(2)}ms`);
            
            // Warn if animation is too slow
            if (duration > 16) {
                console.warn(`Animation "${animationName}" may cause frame drops (${duration.toFixed(2)}ms)`);
            }
        });
    }

    // Cleanup
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        // Clear all active animations
        this.activeAnimations.forEach((animation, element) => {
            if (typeof animation === 'number') {
                clearInterval(animation);
            }
        });
        this.activeAnimations.clear();

        // Remove event listeners
        window.removeEventListener('scroll', this.updateParallaxEffects);
    }
}

// Initialize animation controller
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
    console.log('Animation controller initialized');
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.animationController) {
        window.animationController.destroy();
    }
});
