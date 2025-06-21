// Step Navigation Component
import { Utils, ErrorHandler } from '../js/config.js';

export class StepNavigation {
    constructor(visualization) {
        this.visualization = visualization;
        this.currentStep = 0;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.setupNavigation();
            this.setupAnimationControls();
            this.isInitialized = true;
            
            // Initialize first step
            setTimeout(() => this.activateStep(0), 500);
            
            console.log('Step Navigation initialized successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'StepNavigation.init');
        }
    }

    setupNavigation() {
        const stepBtns = document.querySelectorAll('.step-btn');
        const stepPanels = document.querySelectorAll('.step-panel');

        stepBtns.forEach((btn, index) => {
            Utils.safeAddEventListener(btn, 'click', () => {
                this.activateStep(index);
            });
        });
    }

    activateStep(stepIndex) {
        try {
            const stepBtns = document.querySelectorAll('.step-btn');
            const stepPanels = document.querySelectorAll('.step-panel');

            // Update button states
            stepBtns.forEach(btn => btn.classList.remove('active'));
            if (stepBtns[stepIndex]) {
                stepBtns[stepIndex].classList.add('active');
            }

            // Update panel visibility
            stepPanels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.querySelector(`[data-step="${stepIndex}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            this.currentStep = stepIndex;
            this.triggerStepAnimation(stepIndex);
            
            console.log(`Activated step: ${stepIndex}`);
        } catch (error) {
            ErrorHandler.handle(error, 'activateStep');
        }
    }

    setupAnimationControls() {
        // Convolution animation controls
        const playConvBtn = Utils.safeQuerySelector('#play-conv');
        const resetConvBtn = Utils.safeQuerySelector('#reset-conv');

        if (playConvBtn) {
            Utils.safeAddEventListener(playConvBtn, 'click', () => {
                this.playConvolutionAnimation();
            });
        }

        if (resetConvBtn) {
            Utils.safeAddEventListener(resetConvBtn, 'click', () => {
                this.resetConvolutionAnimation();
            });
        }
    }

    async triggerStepAnimation(stepIndex) {
        if (!this.visualization) return;

        try {
            switch (stepIndex) {
                case 0:
                    // Input step - setup input canvas
                    if (this.visualization.setupInputCanvas) {
                        this.visualization.setupInputCanvas();
                    }
                    break;
                    
                case 1:
                    // Convolution step - setup convolution canvas
                    if (this.visualization.setupConvolutionCanvas) {
                        this.visualization.setupConvolutionCanvas();
                    }
                    break;
                    
                case 2:
                    // Pooling step - setup pooling canvas
                    if (this.visualization.setupPoolingCanvas) {
                        this.visualization.setupPoolingCanvas();
                    }
                    break;
                    
                case 3:
                    // Classification step - setup classification canvas
                    if (this.visualization.setupClassificationCanvas) {
                        this.visualization.setupClassificationCanvas();
                    }
                    break;
            }
        } catch (error) {
            ErrorHandler.handle(error, 'triggerStepAnimation');
        }
    }

    async playConvolutionAnimation() {
        const playBtn = Utils.safeQuerySelector('#play-conv');
        
        try {
            // Disable button during animation
            if (playBtn) {
                playBtn.disabled = true;
                playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            }

            if (this.visualization && this.visualization.playConvolutionAnimation) {
                await this.visualization.playConvolutionAnimation();
            }

        } catch (error) {
            ErrorHandler.handle(error, 'playConvolutionAnimation');
        } finally {
            // Re-enable button
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Animation';
            }
        }
    }

    resetConvolutionAnimation() {
        try {
            if (this.visualization && this.visualization.resetConvolution) {
                this.visualization.resetConvolution();
            }
        } catch (error) {
            ErrorHandler.handle(error, 'resetConvolutionAnimation');
        }
    }

    // Navigation helper methods
    nextStep() {
        const maxStep = document.querySelectorAll('.step-btn').length - 1;
        if (this.currentStep < maxStep) {
            this.activateStep(this.currentStep + 1);
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.activateStep(this.currentStep - 1);
        }
    }

    goToStep(stepIndex) {
        const maxStep = document.querySelectorAll('.step-btn').length - 1;
        if (stepIndex >= 0 && stepIndex <= maxStep) {
            this.activateStep(stepIndex);
        }
    }
}
