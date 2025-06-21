// Navigation Component
import { Utils, ErrorHandler } from '../js/config.js';

export class Navigation {
    constructor() {
        this.navbar = null;
        this.mobileMenuBtn = null;
        this.navMenu = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.navbar = Utils.safeQuerySelector('.navbar');
            this.mobileMenuBtn = Utils.safeQuerySelector('#mobile-menu-btn');
            this.navMenu = Utils.safeQuerySelector('#nav-menu');
            
            this.setupMobileMenu();
            this.setupSmoothScrolling();
            this.setupScrollEffects();
            
            this.isInitialized = true;
            console.log('Navigation initialized successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'Navigation.init');
        }
    }

    setupMobileMenu() {
        if (!this.mobileMenuBtn || !this.navMenu) return;

        Utils.safeAddEventListener(this.mobileMenuBtn, 'click', () => {
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking nav links
        const navLinks = this.navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            Utils.safeAddEventListener(link, 'click', () => {
                this.closeMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        if (!this.navMenu) return;
        
        this.navMenu.classList.toggle('active');
        
        // Update button text
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.textContent = this.navMenu.classList.contains('active') ? '✕' : '☰';
        }
    }

    closeMobileMenu() {
        if (!this.navMenu) return;
        
        this.navMenu.classList.remove('active');
        
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.textContent = '☰';
        }
    }

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            Utils.safeAddEventListener(link, 'click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetElement = Utils.safeQuerySelector(targetId);
                
                if (targetElement) {
                    this.scrollToElement(targetElement);
                }
            });
        });
    }

    scrollToElement(element) {
        if (!element) return;
        
        const offsetTop = element.offsetTop - 80; // Account for fixed navbar
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        
        const handleScroll = Utils.debounce(() => {
            const currentScrollY = window.scrollY;
            
            if (!this.navbar) return;
            
            // Add/remove scrolled class for styling
            if (currentScrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll direction (optional)
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        }, 10);
        
        window.addEventListener('scroll', handleScroll);
    }
}

// Global scroll function for buttons
window.scrollToSection = function(sectionId) {
    const element = Utils.safeQuerySelector(`#${sectionId}`);
    if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};
