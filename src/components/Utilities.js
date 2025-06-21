// Utilities Component
import { Utils, ErrorHandler } from '../js/config.js';

export class Utilities {
    static init() {
        this.setupCodeCopyButtons();
        this.setupNotebookButton();
    }

    static setupCodeCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');
        
        copyButtons.forEach(btn => {
            Utils.safeAddEventListener(btn, 'click', () => {
                this.copyCode(btn);
            });
        });
    }

    static async copyCode(button) {
        try {
            const codeBlock = button.closest('.code-block');
            if (!codeBlock) return;
            
            const codeElement = codeBlock.querySelector('code');
            if (!codeElement) return;
            
            const codeText = codeElement.textContent;
            
            await navigator.clipboard.writeText(codeText);
            
            // Visual feedback
            const originalText = button.textContent;
            button.textContent = '✓ Copied!';
            button.style.background = '#4CAF50';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
            
        } catch (error) {
            ErrorHandler.handle(error, 'copyCode');
            
            // Fallback for older browsers
            this.fallbackCopyCode(button);
        }
    }

    static fallbackCopyCode(button) {
        try {
            const codeBlock = button.closest('.code-block');
            if (!codeBlock) return;
            
            const codeElement = codeBlock.querySelector('code');
            if (!codeElement) return;
            
            // Create temporary textarea
            const textarea = document.createElement('textarea');
            textarea.value = codeElement.textContent;
            document.body.appendChild(textarea);
            
            // Select and copy
            textarea.select();
            document.execCommand('copy');
            
            // Cleanup
            document.body.removeChild(textarea);
            
            // Visual feedback
            const originalText = button.textContent;
            button.textContent = '✓ Copied!';
            
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
            
        } catch (error) {
            ErrorHandler.handle(error, 'fallbackCopyCode');
        }
    }

    static setupNotebookButton() {
        // This would be set up based on the actual notebook implementation
        window.openNotebook = function() {
            try {
                // Check if notebook exists
                const notebookPath = './MNIST_with_CNN.ipynb';
                
                // In a real implementation, you might:
                // 1. Open in Jupyter Lab/Notebook
                // 2. Download the file
                // 3. Open in Colab
                
                // For now, just show an alert
                alert('This would open the full Jupyter Notebook. In a real implementation, this would integrate with Jupyter Lab or Google Colab.');
                
                console.log('Opening notebook:', notebookPath);
            } catch (error) {
                ErrorHandler.handle(error, 'openNotebook');
            }
        };
    }

    static scrollToSection(sectionId) {
        try {
            const section = document.getElementById(sectionId);
            if (section) {
                const offset = 70;
                const elementPosition = section.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            ErrorHandler.handle(error, 'scrollToSection');
        }
    }
}

// Global functions for backward compatibility
window.copyCode = function(button) {
    Utilities.copyCode(button);
};

window.openNotebook = function() {
    Utilities.openNotebook();
};

window.scrollToSection = function(sectionId) {
    Utilities.scrollToSection(sectionId);
};
