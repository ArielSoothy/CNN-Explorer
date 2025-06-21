// Application Configuration and Constants
export const CONFIG = {
    ANIMATION_SPEED: 50,
    CANVAS_SIZE: 280,
    PIXEL_SIZE: 10,
    SAMPLE_DIGIT_SIZE: 28,
    LOADING_DURATION: 1000
};

// Utility Functions
export const Utils = {
    // Safe element selection with error handling
    safeQuerySelector: (selector) => {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    },

    // Safe event listener addition
    safeAddEventListener: (element, event, handler) => {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler);
            return true;
        }
        console.warn('Failed to add event listener:', { element, event });
        return false;
    },

    // Debounce function for performance optimization
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Canvas utility functions
    canvas: {
        getContext: (canvasId) => {
            const canvas = Utils.safeQuerySelector(`#${canvasId}`);
            return canvas ? canvas.getContext('2d') : null;
        },

        clear: (ctx, width, height) => {
            if (ctx) {
                ctx.clearRect(0, 0, width, height);
            }
        },

        drawPixel: (ctx, x, y, size, color = '#000000') => {
            if (ctx) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, size, size);
            }
        }
    },

    // Animation helpers
    animation: {
        fadeOut: (element, duration = 500) => {
            if (!element) return Promise.resolve();
            
            return new Promise((resolve) => {
                element.style.transition = `opacity ${duration}ms ease-out`;
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    resolve();
                }, duration);
            });
        },

        fadeIn: (element, duration = 500) => {
            if (!element) return Promise.resolve();
            
            return new Promise((resolve) => {
                element.style.display = 'block';
                element.style.opacity = '0';
                element.style.transition = `opacity ${duration}ms ease-in`;
                
                setTimeout(() => {
                    element.style.opacity = '1';
                    setTimeout(resolve, duration);
                }, 10);
            });
        }
    }
};

// Error Handler
export class ErrorHandler {
    static handle(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        // In development, you might want to show errors to the user
        // Check if we're in development mode (you can set this manually)
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isDevelopment) {
            this.showUserError(`An error occurred in ${context}. Check console for details.`);
        }
    }

    static showUserError(message) {
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}
