// CNNVision - Main JavaScript

class CNNVision {
    constructor() {
        this.currentSection = 'hero';
        this.init();
    }

    init() {
        this.bindEvents();
        this.initScrollAnimations();
        this.updateNavigation();
        this.initProgressBar();
    }

    bindEvents() {
        // Smooth scrolling for navigation
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
        
        // Navigation clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.scrollToSection(section);
            });
        });

        // CTA button
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                this.scrollToSection('concepts');
            });
        }

        // Window resize
        window.addEventListener('resize', this.throttle(this.handleResize.bind(this), 100));
    }

    handleScroll() {
        this.updateNavigation();
        this.updateProgressBar();
        this.animateOnScroll();
        this.updateCNNVisualization();
    }

    updateCNNVisualization() {
        // Make the CNN visualization respond to scroll position
        const heroSection = document.getElementById('hero');
        if (heroSection && window.cnn3D) {
            const heroRect = heroSection.getBoundingClientRect();
            const scrollProgress = Math.max(0, Math.min(1, -heroRect.top / heroRect.height));
            
            // Adjust 3D visualization based on scroll
            if (window.cnn3D.adjustForScroll) {
                window.cnn3D.adjustForScroll(scrollProgress);
            }
        }
    }

    updateNavigation() {
        const sections = ['hero', 'concepts', 'demo', 'notebook'];
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        let currentSection = 'hero';
        
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                    currentSection = sectionId;
                }
            }
        });

        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            
            // Update nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.section === currentSection) {
                    item.classList.add('active');
                }
            });
        }
    }

    updateProgressBar() {
        const sections = ['hero', 'concepts', 'demo', 'notebook'];
        const currentIndex = sections.indexOf(this.currentSection);
        const progress = ((currentIndex + 1) / sections.length) * 100;
        
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    initProgressBar() {
        // Initialize progress bar
        this.updateProgressBar();
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    initScrollAnimations() {
        // Add intersection observer for scroll animations
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

        // Observe elements with animation classes
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        // Add animation classes to concept cards
        document.querySelectorAll('.concept-card').forEach((card, index) => {
            card.classList.add('animate-on-scroll', 'fade-up');
            card.style.animationDelay = `${index * 0.1}s`;
            observer.observe(card);
        });
    }

    animateOnScroll() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Smooth transition effects for concept cards
        const conceptCards = document.querySelectorAll('.concept-card');
        conceptCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.top + cardRect.height / 2;
            const distanceFromCenter = Math.abs(cardCenter - windowHeight / 2);
            const maxDistance = windowHeight / 2;
            const proximity = Math.max(0, 1 - distanceFromCenter / maxDistance);
            
            // Subtle scale and opacity based on proximity to viewport center
            const scale = 0.95 + (proximity * 0.05);
            const opacity = 0.7 + (proximity * 0.3);
            
            card.style.transform = `scale(${scale})`;
            card.style.opacity = opacity;
        });
    }

    handleResize() {
        // Handle responsive changes
        this.updateNavigation();
        this.updateProgressBar();
    }

    // Utility function to throttle event handlers
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

    // Utility function to debounce event handlers
    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
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

    // Method to handle concept card interactions
    initConceptCards() {
        document.querySelectorAll('.concept-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const concept = e.currentTarget.dataset.concept;
                this.showConceptDetail(concept);
            });

            // Add hover effects
            card.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    showConceptDetail(concept) {
        // Placeholder for concept detail modal/page
        console.log(`Show detail for concept: ${concept}`);
        // This will be implemented in Phase 2
    }

    // Method to show loading states
    showLoading(element) {
        if (element) {
            element.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            `;
        }
    }

    hideLoading(element, content) {
        if (element) {
            element.innerHTML = content;
        }
    }

    // Method to handle errors gracefully
    handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);
        
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <div class="error-content">
                <h3>Oops! Something went wrong</h3>
                <p>We encountered an error while loading this content. Please refresh the page and try again.</p>
                <button onclick="window.location.reload()" class="retry-button">Retry</button>
            </div>
        `;
        
        // You could append this to a specific container or show as a modal
        document.body.appendChild(errorMessage);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 10000);
    }
}

// Global utility functions
window.scrollToSection = function(sectionId) {
    if (window.cnnVision) {
        window.cnnVision.scrollToSection(sectionId);
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.cnnVision = new CNNVision();
        console.log('CNNVision application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize CNNVision:', error);
    }
});

// Handle page visibility changes (for pausing animations when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause any running animations
        document.body.classList.add('paused');
    } else {
        // Resume animations
        document.body.classList.remove('paused');
    }
});

// Add some basic performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    
    // Report to analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_load_time', {
            event_category: 'Performance',
            value: Math.round(loadTime)
        });
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CNNVision;
}
