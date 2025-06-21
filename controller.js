// Enhanced CNN Website Controller
class CNNController {
    constructor() {
        this.visualization = new CNNVisualization();
        this.activeAnimations = new Map();
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupControls());
        } else {
            this.setupControls();
        }
    }

    setupControls() {
        // Setup step navigation
        this.setupStepNavigation();
        
        // Setup animation controls
        this.setupAnimationControls();
        
        // Setup interactive demo
        if (this.visualization.setupInteractiveDemo) {
            this.visualization.setupInteractiveDemo();
        }
        
        // Initialize first step
        setTimeout(() => this.triggerStepAnimation(0), 500);
    }

    setupStepNavigation() {
        const stepBtns = document.querySelectorAll('.step-btn');
        const stepPanels = document.querySelectorAll('.step-panel');

        stepBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                // Update button states
                stepBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update panel visibility  
                stepPanels.forEach(p => p.classList.remove('active'));
                const targetPanel = document.querySelector(`[data-step="${index}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    this.triggerStepAnimation(index);
                }
            });
        });
    }

    setupAnimationControls() {
        const playConvBtn = document.getElementById('play-conv');
        const resetConvBtn = document.getElementById('reset-conv');

        if (playConvBtn) {
            playConvBtn.addEventListener('click', () => this.toggleConvolutionAnimation());
        }

        if (resetConvBtn) {
            resetConvBtn.addEventListener('click', () => this.resetConvolutionAnimation());
        }
    }

    triggerStepAnimation(stepIndex) {
        console.log('Triggering animation for step:', stepIndex);
        
        // Stop any running animations first
        this.stopAllAnimations();
        
        try {
            switch(stepIndex) {
                case 0:
                    if (this.visualization.setupInputCanvas) {
                        this.visualization.setupInputCanvas();
                    }
                    break;
                case 1:
                    if (this.visualization.setupConvolutionCanvas) {
                        this.visualization.setupConvolutionCanvas();
                    }
                    break;
                case 2:
                    if (this.visualization.setupPoolingCanvas) {
                        this.visualization.setupPoolingCanvas();
                    }
                    break;
                case 3:
                    if (this.visualization.setupClassificationCanvas) {
                        this.visualization.setupClassificationCanvas();
                    }
                    break;
                default:
                    console.warn('Unknown step index:', stepIndex);
            }
        } catch (error) {
            console.error('Error in triggerStepAnimation:', error);
        }
    }

    toggleConvolutionAnimation() {
        const playBtn = document.getElementById('play-conv');
        const animationKey = 'convolution';
        
        if (this.activeAnimations.has(animationKey)) {
            // Stop animation
            this.stopAnimation(animationKey);
            this.updatePlayButton(false);
        } else {
            // Start animation
            this.startConvolutionAnimation();
            this.updatePlayButton(true);
        }
    }

    updatePlayButton(isPlaying) {
        const playBtn = document.getElementById('play-conv');
        const statusIndicator = document.getElementById('conv-status');
        
        if (!playBtn) return;

        if (isPlaying) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            playBtn.classList.remove('btn-primary');
            playBtn.classList.add('btn-pause');
            if (statusIndicator) {
                statusIndicator.classList.add('active');
            }
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play Animation';
            playBtn.classList.remove('btn-pause');
            playBtn.classList.add('btn-primary');
            if (statusIndicator) {
                statusIndicator.classList.remove('active');
            }
        }
    }

    startConvolutionAnimation() {
        const animationKey = 'convolution';
        
        if (this.visualization.animateConvolution) {
            const animation = this.visualization.animateConvolution();
            if (animation) {
                this.activeAnimations.set(animationKey, animation);
                
                // Auto-stop after 30 seconds and reset button
                setTimeout(() => {
                    if (this.activeAnimations.has(animationKey)) {
                        this.stopAnimation(animationKey);
                        this.updatePlayButton(false);
                    }
                }, 30000);
            }
        }
    }

    resetConvolutionAnimation() {
        this.stopAnimation('convolution');
        if (this.visualization.setupConvolutionCanvas) {
            this.visualization.setupConvolutionCanvas();
        }
        this.updatePlayButton(false);
    }

    stopAnimation(key) {
        if (this.activeAnimations.has(key)) {
            const animation = this.activeAnimations.get(key);
            if (animation && animation.stop) {
                animation.stop();
            }
            this.activeAnimations.delete(key);
        }
    }

    stopAllAnimations() {
        this.activeAnimations.forEach((animation, key) => {
            if (animation && animation.stop) {
                animation.stop();
            }
        });
        this.activeAnimations.clear();
        this.updatePlayButton(false);
    }
}

// Add to existing script.js after CNNVisualization class
// Initialize controller when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Give a small delay to ensure all other scripts are loaded
    setTimeout(() => {
        try {
            window.cnnController = new CNNController();
        } catch (error) {
            console.error('Error initializing CNN Controller:', error);
        }
    }, 1000);
});
