// CNN Interactive Website JavaScript
// Main functionality for the educational CNN website

document.addEventListener('DOMContentLoaded', () => {
    // Always hide loading screen first
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);
    
    // Then try to initialize components
    setTimeout(() => {
        try {
            new CNNWebsite();
        } catch (error) {
            console.error('Error initializing CNNWebsite:', error);
        }
        
        try {
            new CNNAnimation();
        } catch (error) {
            console.error('Error initializing CNNAnimation:', error);
            // This is non-critical, continue without 3D animation
        }
    }, 1500);
});

// CNN Website Main Class
class CNNWebsite {
    constructor() {
        this.visualization = new CNNVisualization();
        this.activeAnimations = new Map(); // Track active animations
        this.setupStepNavigation();
        this.setupAnimationControls();
        this.setupInteractiveDemo();
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

        // Initialize first step
        this.triggerStepAnimation(0);
    }

    setupAnimationControls() {
        // Convolution controls
        const playConvBtn = document.getElementById('play-conv');
        const resetConvBtn = document.getElementById('reset-conv');

        if (playConvBtn) {
            playConvBtn.addEventListener('click', () => this.toggleConvolutionAnimation());
        }

        if (resetConvBtn) {
            resetConvBtn.addEventListener('click', () => this.resetConvolutionAnimation());
        }
    }

    setupInteractiveDemo() {
        // Setup drawing canvas and prediction functionality
        this.visualization.setupInteractiveDemo();
    }

    triggerStepAnimation(stepIndex) {
        console.log('Triggering animation for step:', stepIndex);
        
        // Stop any running animations first
        this.stopAllAnimations();
        
        try {
            switch(stepIndex) {
                case 0:
                    this.visualization.setupInputCanvas();
                    break;
                case 1:
                    this.visualization.setupConvolutionCanvas();
                    break;
                case 2:
                    this.visualization.setupPoolingCanvas();
                    break;
                case 3:
                    this.visualization.setupClassificationCanvas();
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
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play Animation';
            playBtn.classList.remove('btn-pause');
            playBtn.classList.add('btn-primary');
        } else {
            // Start animation
            this.startConvolutionAnimation();
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            playBtn.classList.remove('btn-primary');
            playBtn.classList.add('btn-pause');
        }
    }

    startConvolutionAnimation() {
        const animationKey = 'convolution';
        const animation = this.visualization.animateConvolution();
        this.activeAnimations.set(animationKey, animation);
        
        // Auto-stop after 30 seconds and reset button
        setTimeout(() => {
            if (this.activeAnimations.has(animationKey)) {
                this.stopAnimation(animationKey);
                const playBtn = document.getElementById('play-conv');
                if (playBtn) {
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Play Animation';
                    playBtn.classList.remove('btn-pause');
                    playBtn.classList.add('btn-primary');
                }
            }
        }, 30000);
    }

    resetConvolutionAnimation() {
        this.stopAnimation('convolution');
        this.visualization.setupConvolutionCanvas();
        
        const playBtn = document.getElementById('play-conv');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play Animation';
            playBtn.classList.remove('btn-pause');
            playBtn.classList.add('btn-primary');
        }
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
    }
}

class CNNVisualization {
    constructor() {
        try {
            this.setupCanvases();
            this.createSampleData();
        } catch (error) {
            console.error('Error in CNNVisualization constructor:', error);
        }
    }

    setupCanvases() {
        // Don't try to setup canvases immediately since panels might be hidden
        // They will be setup when each step is shown
    }

    createSampleData() {
        // Create a sample digit "5" for demonstration
        this.sampleDigit = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
    }

    setupInputCanvas() {
        const canvas = document.getElementById('input-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const pixelSize = canvas.width / 28;
        
        // Draw the sample digit
        for (let i = 0; i < 28; i++) {
            for (let j = 0; j < 28; j++) {
                const value = (i < this.sampleDigit.length && j < this.sampleDigit[i].length) 
                    ? this.sampleDigit[i][j] : 0;
                const color = value > 0 ? `rgb(${255 - value * 255}, ${255 - value * 255}, ${255 - value * 255})` : '#f8f8f8';
                
                ctx.fillStyle = color;
                ctx.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
                
                // Add grid lines
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    setupConvolutionCanvas() {
        const canvas = document.getElementById('conv-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8faff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the same digit "5" as input (smaller version)
        const inputSize = 120;
        const pixelSize = inputSize / 28;
        const startX = 20;
        const startY = 50;
        
        // Draw input image background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(startX, startY, inputSize, inputSize);
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, inputSize, inputSize);
        
        // Draw the digit "5" pixel by pixel
        for (let i = 0; i < Math.min(22, this.sampleDigit.length); i++) {
            for (let j = 0; j < 22; j++) {
                const value = (i < this.sampleDigit.length && j < this.sampleDigit[i].length) 
                    ? this.sampleDigit[i][j] : 0;
                if (value > 0) {
                    const color = `rgb(${255 - value * 255}, ${255 - value * 255}, ${255 - value * 255})`;
                    ctx.fillStyle = color;
                    ctx.fillRect(startX + j * pixelSize + 10, startY + i * pixelSize + 10, pixelSize, pixelSize);
                }
            }
        }
        
        // 3x3 Filter/Kernel (edge detection filter)
        const filterSize = 60;
        const filterX = 60;
        const filterY = 80;
        
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.fillRect(filterX, filterY, filterSize, filterSize);
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 3;
        ctx.strokeRect(filterX, filterY, filterSize, filterSize);
        
        // Draw filter pattern (edge detection)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px monospace';
        const filterValues = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const x = filterX + j * 20 + 5;
                const y = filterY + i * 20 + 15;
                ctx.fillText(filterValues[i][j].toString(), x, y);
            }
        }
        
        // Output feature map (result of convolution)
        const outputSize = 100;
        const outputX = 280;
        const outputY = 60;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(outputX, outputY, outputSize, outputSize);
        ctx.strokeStyle = '#00AA00';
        ctx.lineWidth = 2;
        ctx.strokeRect(outputX, outputY, outputSize, outputSize);
        
        // Simulate convolution result - emphasize edges of the "5"
        this.drawConvolutionResult(ctx, outputX, outputY, outputSize);
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.fillText('Input: Digit "5"', startX, startY - 10);
        ctx.fillText('3x3 Edge Filter', filterX, filterY - 10);
        ctx.fillText('Feature Map', outputX, outputY - 10);
        ctx.fillText('(Edges Detected)', outputX, outputY + outputSize + 15);
        
        // Arrow
        this.drawArrow(ctx, 150, 115, 270, 115);
        
        // Convolution operation text
        ctx.fillStyle = '#0066FF';
        ctx.font = 'bold 14px Inter';
        ctx.fillText('Convolution: Finding Edges in "5"', 120, 280);
        
        this.animationState = { filterX: filterX, filterY: filterY };
    }

    drawConvolutionResult(ctx, startX, startY, size) {
        // Create a simplified edge-detected version of the "5"
        const edgePattern = [
            [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0]
        ];
        
        const pixelSize = size / 16;
        for (let i = 0; i < edgePattern.length; i++) {
            for (let j = 0; j < edgePattern[i].length; j++) {
                if (edgePattern[i][j] > 0) {
                    const intensity = Math.random() * 0.5 + 0.5; // Random intensity for realistic effect
                    ctx.fillStyle = `rgba(0, 170, 0, ${intensity})`;
                    ctx.fillRect(startX + j * pixelSize, startY + i * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    setupPoolingCanvas() {
        const canvas = document.getElementById('pooling-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8faff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Feature map from convolution (edges of digit "5")
        const gridSize = 12;
        const cellSize = 12;
        const startX = 30;
        const startY = 50;
        
        // Create feature map that represents edge-detected "5"
        const featureMap = this.createConvolutionFeatureMap();
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const value = featureMap[i] && featureMap[i][j] ? featureMap[i][j] : 0;
                const intensity = Math.min(1, value + Math.random() * 0.3);
                const color = `rgba(0, 170, 0, ${intensity})`;
                
                ctx.fillStyle = color;
                ctx.fillRect(startX + j * cellSize, startY + i * cellSize, cellSize, cellSize);
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(startX + j * cellSize, startY + i * cellSize, cellSize, cellSize);
            }
        }
        
        // Highlight 2x2 pooling window
        this.poolingWindowPos = { row: 0, col: 0 };
        this.drawPoolingWindow(ctx, startX, startY, cellSize);
        
        // Arrow
        this.drawArrow(ctx, 200, 115, 240, 115);
        
        // Pooled result (half the size)
        const pooledSize = 6;
        const pooledCellSize = 18;
        const pooledStartX = 270;
        const pooledStartY = 70;
        
        for (let i = 0; i < pooledSize; i++) {
            for (let j = 0; j < pooledSize; j++) {
                // Take max from corresponding 2x2 region
                const origI = i * 2;
                const origJ = j * 2;
                let maxVal = 0;
                
                for (let di = 0; di < 2; di++) {
                    for (let dj = 0; dj < 2; dj++) {
                        if (featureMap[origI + di] && featureMap[origI + di][origJ + dj]) {
                            maxVal = Math.max(maxVal, featureMap[origI + di][origJ + dj]);
                        }
                    }
                }
                
                const intensity = Math.min(1, maxVal + Math.random() * 0.2);
                const color = `rgba(0, 100, 170, ${intensity})`;
                ctx.fillStyle = color;
                ctx.fillRect(pooledStartX + j * pooledCellSize, pooledStartY + i * pooledCellSize, pooledCellSize, pooledCellSize);
                ctx.strokeStyle = '#0066AA';
                ctx.strokeRect(pooledStartX + j * pooledCellSize, pooledStartY + i * pooledCellSize, pooledCellSize, pooledCellSize);
            }
        }
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.fillText('Convolved "5"', startX, startY - 10);
        ctx.fillText(`${gridSize}×${gridSize} Feature Map`, startX, startY + gridSize * cellSize + 15);
        ctx.fillText('Max Pooled', pooledStartX, pooledStartY - 10);
        ctx.fillText(`${pooledSize}×${pooledSize} Result`, pooledStartX, pooledStartY + pooledSize * pooledCellSize + 15);
        
        // Max pooling explanation
        ctx.fillStyle = '#FF6666';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('2×2 Max Pooling Window', startX, startY + gridSize * cellSize + 35);
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        ctx.fillText('Reduces size while keeping', startX, startY + gridSize * cellSize + 50);
        ctx.fillText('most important features', startX, startY + gridSize * cellSize + 62);
    }

    createConvolutionFeatureMap() {
        // Create a feature map that represents the edges of digit "5"
        return [
            [0,0,0,0,0.8,0.9,0.8,0.9,0.8,0.7,0,0],
            [0,0,0,0,0.7,0.8,0.7,0.8,0.7,0.6,0,0],
            [0,0,0,0,0.9,0.8,0,0,0,0,0,0],
            [0,0,0,0,0.8,0.7,0,0,0,0,0,0],
            [0,0,0,0,0.9,0.8,0.7,0.8,0.6,0,0,0],
            [0,0,0,0,0,0,0,0,0,0.8,0.7,0],
            [0,0,0,0,0,0,0,0,0,0.7,0.8,0],
            [0,0,0,0,0,0,0,0,0,0.8,0.7,0],
            [0,0,0,0,0.7,0.6,0,0,0,0.8,0.7,0],
            [0,0,0,0,0.8,0.7,0.6,0.7,0.8,0.7,0,0],
            [0,0,0,0,0,0.6,0.7,0.8,0.6,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ];
    }

    drawPoolingWindow(ctx, startX, startY, cellSize) {
        const row = this.poolingWindowPos.row;
        const col = this.poolingWindowPos.col;
        
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 4;
        ctx.strokeRect(startX + col * cellSize, startY + row * cellSize, cellSize * 2, cellSize * 2);
        
        // Add animation effect
        ctx.shadowColor = '#FF6666';
        ctx.shadowBlur = 15;
        ctx.strokeRect(startX + col * cellSize, startY + row * cellSize, cellSize * 2, cellSize * 2);
        ctx.shadowBlur = 0;
    }

    setupClassificationCanvas() {
        const canvas = document.getElementById('classification-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8faff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Flattened features from pooled feature map
        const featureHeight = 12;
        const featureWidth = 180;
        const startY = 60;
        
        // Draw flattened features background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, startY, featureWidth, featureHeight);
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, startY, featureWidth, featureHeight);
        
        // Draw feature segments (representing flattened 6x6 pooled map = 36 features)
        const segmentWidth = featureWidth / 36;
        for (let i = 0; i < 36; i++) {
            // Create pattern that represents compressed "5" features
            const intensity = this.getFeatureIntensityForDigit5(i);
            ctx.fillStyle = `rgba(0, 102, 255, ${intensity})`;
            ctx.fillRect(20 + i * segmentWidth, startY + 2, segmentWidth - 1, featureHeight - 4);
        }
        
        // Neural network output nodes (digits 0-9)
        const nodeRadius = 15;
        const outputNodes = 10;
        const outputStartX = 280;
        const outputStartY = 40;
        
        // Realistic probabilities for digit "5" prediction
        const probabilities = [
            0.01,  // 0
            0.02,  // 1
            0.03,  // 2
            0.02,  // 3
            0.04,  // 4
            0.84,  // 5 (highest probability)
            0.02,  // 6
            0.01,  // 7
            0.01,  // 8
            0.00   // 9
        ];
        
        // Draw connections from features to output nodes
        ctx.strokeStyle = 'rgba(0, 102, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < outputNodes; i++) {
            const nodeY = outputStartY + i * 22;
            const connectionIntensity = probabilities[i] * 2; // Make connections stronger for higher prob
            ctx.strokeStyle = `rgba(0, 102, 255, ${0.1 + connectionIntensity})`;
            ctx.lineWidth = 1 + connectionIntensity * 2;
            
            for (let j = 0; j < 5; j++) { // Draw 5 connections per node
                ctx.beginPath();
                ctx.moveTo(200, startY + featureHeight/2);
                ctx.lineTo(outputStartX - 20, nodeY);
                ctx.stroke();
            }
        }
        
        // Draw output nodes with probability-based styling
        for (let i = 0; i < outputNodes; i++) {
            const nodeY = outputStartY + i * 22;
            const probability = probabilities[i];
            
            // Node appearance based on probability
            const intensity = 0.3 + probability * 0.7;
            const nodeColor = i === 5 ? '#FF6666' : '#0066FF'; // Highlight predicted digit
            
            ctx.fillStyle = `${nodeColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(outputStartX, nodeY, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Node border
            ctx.strokeStyle = nodeColor;
            ctx.lineWidth = i === 5 ? 3 : 1;
            ctx.stroke();
            
            // Digit label
            ctx.fillStyle = i === 5 ? 'white' : 'white';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), outputStartX, nodeY + 5);
            
            // Probability percentage
            ctx.fillStyle = '#333';
            ctx.font = '11px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`${(probability * 100).toFixed(1)}%`, outputStartX + 25, nodeY + 4);
        }
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Flattened Features', 20, startY - 10);
        ctx.fillText('(36 values from 6×6 pooled map)', 20, startY - 25);
        ctx.fillText('Output Probabilities', outputStartX - 30, 25);
        
        // Arrow
        this.drawArrow(ctx, 210, startY + featureHeight/2, 250, startY + featureHeight/2);
        
        // Highlight prediction
        ctx.fillStyle = '#FF6666';
        ctx.font = 'bold 18px Inter';
        ctx.fillText('Prediction: 5', 50, 280);
        
        ctx.fillStyle = '#00AA00';
        ctx.font = 'bold 14px Inter';
        ctx.fillText('Confidence: 84.0%', 180, 280);
        
        // Add visual emphasis to the prediction
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(outputStartX - 20, outputStartY + 5 * 22 - 18, 70, 36);
        ctx.setLineDash([]);
    }

    getFeatureIntensityForDigit5(index) {
        // Create a pattern that represents what features would be active for digit "5"
        // Higher values for features that would be important for recognizing "5"
        const pattern = [
            0.8, 0.9, 0.8, 0.7, 0.6, 0.4, // Top horizontal line features
            0.2, 0.3, 0.2, 0.1, 0.1, 0.1, // Empty areas
            0.9, 0.8, 0.7, 0.3, 0.2, 0.1, // Left vertical line
            0.8, 0.7, 0.6, 0.5, 0.4, 0.3, // Middle horizontal
            0.2, 0.1, 0.2, 0.8, 0.9, 0.8, // Right vertical
            0.7, 0.6, 0.8, 0.9, 0.7, 0.6  // Bottom curve
        ];
        return pattern[index] || Math.random() * 0.3;
    }

    drawArrow(ctx, fromX, fromY, toX, toY) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI/6), toY - headLength * Math.sin(angle - Math.PI/6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI/6), toY - headLength * Math.sin(angle + Math.PI/6));
        ctx.stroke();
    }

    animateConvolution() {
        const canvas = document.getElementById('conv-canvas');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        let step = 0;
        const maxSteps = 25;
        
        const controller = this.createControllableAnimation();
        
        const animate = () => {
            if (!controller.getAnimationRunning()) return;
            
            // Clear and redraw base
            this.setupConvolutionCanvas();
            
            // Calculate filter position
            const startX = 30;
            const startY = 60;
            const stepSize = 12;
            const gridSize = 5;
            
            const row = Math.floor(step / gridSize);
            const col = step % gridSize;
            
            const filterX = startX + col * stepSize;
            const filterY = startY + row * stepSize;
            
            // Enhanced filter visualization
            ctx.shadowColor = '#FF6B35';
            ctx.shadowBlur = 20;
            const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() * 0.01);
            ctx.fillStyle = `rgba(255, 107, 53, ${pulseIntensity})`;
            ctx.fillRect(filterX, filterY, 40, 40);
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = '#FF6B35';
            ctx.lineWidth = 3;
            ctx.strokeRect(filterX, filterY, 40, 40);
            
            // Filter operation indicator
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Inter';
            ctx.fillText('⊗', filterX + 15, filterY + 27);
            
            // Enhanced output visualization
            const outputX = 280 + col * 8;
            const outputY = 60 + row * 8;
            const activation = Math.random() * 0.8 + 0.2;
            
            ctx.shadowColor = '#10B981';
            ctx.shadowBlur = 15;
            ctx.fillStyle = `rgba(16, 185, 129, ${activation})`;
            ctx.fillRect(outputX, outputY, 12, 12);
            ctx.strokeStyle = '#10B981';
            ctx.strokeRect(outputX, outputY, 12, 12);
            ctx.shadowBlur = 0;
            
            // Animated connection line
            ctx.strokeStyle = '#0066FF';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]);
            ctx.shadowColor = '#0066FF';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(filterX + 20, filterY + 40);
            ctx.lineTo(outputX + 6, outputY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
            
            // Professional progress display
            ctx.fillStyle = '#1F2937';
            ctx.font = 'bold 16px Inter';
            ctx.fillText(`Processing: ${step + 1}/${maxSteps}`, 120, 260);
            
            // Animated progress bar
            const progressWidth = 200;
            const progressHeight = 12;
            const progressX = 120;
            const progressY = 270;
            
            // Background
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
            
            // Progress fill with gradient
            const gradient = ctx.createLinearGradient(progressX, 0, progressX + progressWidth, 0);
            gradient.addColorStop(0, '#0066FF');
            gradient.addColorStop(1, '#00AADD');
            ctx.fillStyle = gradient;
            ctx.fillRect(progressX, progressY, (progressWidth * (step + 1)) / maxSteps, progressHeight);
            
            // Progress shine effect
            const shineGradient = ctx.createLinearGradient(progressX, 0, progressX + progressWidth, 0);
            shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = shineGradient;
            ctx.fillRect(progressX, progressY, (progressWidth * (step + 1)) / maxSteps, progressHeight);
            
            step = (step + 1) % maxSteps;
            
            const delay = step === 0 ? 1500 : 500;
            const timeoutId = setTimeout(() => {
                if (controller.getAnimationRunning()) animate();
            }, delay);
            
            controller.setAnimationId(timeoutId);
        };
        
        animate();
        return controller;
    }

    setupInteractiveDemo() {
        const canvas = document.getElementById('drawing-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        const clearCanvas = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add clear animation
            canvas.style.transform = 'scale(0.95)';
            setTimeout(() => {
                canvas.style.transform = 'scale(1)';
            }, 150);
        };

        const startDrawing = (e) => {
            isDrawing = true;
            canvas.style.borderColor = '#00AADD';
            draw(e);
        };

        const stopDrawing = () => {
            isDrawing = false;
            canvas.style.borderColor = '#0066FF';
            ctx.beginPath();
        };

        const draw = (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.lineWidth = 15;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'black';

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);

            // Add drawing effect
            this.createDrawingParticles(x, y);
        };

        // Touch support
        const getTouchPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        };

        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });

        // Enhanced buttons
        const clearBtn = document.getElementById('clear-canvas');
        const predictBtn = document.getElementById('predict-digit');

        clearBtn.addEventListener('click', () => {
            clearCanvas();
            this.resetPrediction();
        });

        predictBtn.addEventListener('click', () => {
            this.animatedPrediction();
        });

        clearCanvas();
    }

    createDrawingParticles(x, y) {
        // Create small visual particles when drawing
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#0066FF';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.animation = 'particleFade 0.5s ease-out forwards';
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
    }

    resetPrediction() {
        const digitDisplay = document.querySelector('.predicted-digit');
        const confidenceDisplay = document.querySelector('.confidence-score');
        digitDisplay.textContent = '?';
        confidenceDisplay.textContent = 'Confidence: --%';
        
        // Reset layer visualizations
        document.querySelectorAll('.layer-stage').forEach(stage => {
            stage.style.opacity = '0.5';
        });
    }

    animatedPrediction() {
        const digitDisplay = document.querySelector('.predicted-digit');
        const confidenceDisplay = document.querySelector('.confidence-score');
        const layerStages = document.querySelectorAll('.layer-stage');

        // Show processing animation
        digitDisplay.textContent = '...';
        digitDisplay.style.animation = 'digitPulse 0.5s infinite';

        // Animate through layers
        layerStages.forEach((stage, index) => {
            setTimeout(() => {
                stage.style.opacity = '1';
                stage.style.transform = 'scale(1.1)';
                stage.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    stage.style.transform = 'scale(1)';
                }, 300);
            }, index * 500);
        });

        // Final prediction
        setTimeout(() => {
            const prediction = Math.floor(Math.random() * 10);
            const confidence = (Math.random() * 10 + 90).toFixed(1);
            
            digitDisplay.style.animation = '';
            digitDisplay.textContent = prediction;
            confidenceDisplay.textContent = `Confidence: ${confidence}%`;
            
            // Celebration effect
            this.createCelebrationEffect();
        }, layerStages.length * 500 + 500);
    }

    createCelebrationEffect() {
        // Create confetti-like effect
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '0px';
                confetti.style.width = '6px';
                confetti.style.height = '6px';
                confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
                confetti.style.pointerEvents = 'none';
                confetti.style.animation = 'confettiFall 2s ease-out forwards';
                
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 2000);
            }, i * 100);
        }
    }

    setupEnhancedCanvas() {
        // Add hover effects to all canvases
        document.querySelectorAll('canvas').forEach(canvas => {
            canvas.addEventListener('mouseenter', () => {
                canvas.style.transform = 'scale(1.02)';
                canvas.style.transition = 'transform 0.3s ease';
            });
            
            canvas.addEventListener('mouseleave', () => {
                canvas.style.transform = 'scale(1)';
            });
        });
    }
}

// Enhanced Animation Control Methods
CNNVisualization.prototype.createControllableAnimation = function(animationFn, canvas, maxDuration = 30000) {
    let animationRunning = true;
    let animationId = null;
    
    const controller = {
        stop: () => {
            animationRunning = false;
            if (animationId) {
                clearTimeout(animationId);
                animationId = null;
            }
        },
        isRunning: () => animationRunning,
        setAnimationId: (id) => { animationId = id; },
        getAnimationRunning: () => animationRunning,
        setAnimationRunning: (running) => { animationRunning = running; }
    };
    
    // Auto-stop after maxDuration
    setTimeout(() => {
        controller.stop();
    }, maxDuration);
    
    return controller;
};

// Override the animateConvolution method to return a controllable animation
CNNVisualization.prototype.animateConvolutionControllable = function() {
    const canvas = document.getElementById('conv-canvas');
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    let step = 0;
    const maxSteps = 25;
    
    const controller = this.createControllableAnimation();
    
    const animate = () => {
        if (!controller.getAnimationRunning()) return;
        
        // Clear and redraw base
        this.setupConvolutionCanvas();
        
        // Calculate filter position
        const startX = 30;
        const startY = 60;
        const stepSize = 12;
        const gridSize = 5;
        
        const row = Math.floor(step / gridSize);
        const col = step % gridSize;
        
        const filterX = startX + col * stepSize;
        const filterY = startY + row * stepSize;
        
        // Enhanced filter visualization
        ctx.shadowColor = '#FF6B35';
        ctx.shadowBlur = 20;
        const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() * 0.01);
        ctx.fillStyle = `rgba(255, 107, 53, ${pulseIntensity})`;
        ctx.fillRect(filterX, filterY, 40, 40);
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 3;
        ctx.strokeRect(filterX, filterY, 40, 40);
        
        // Filter operation indicator
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Inter';
        ctx.fillText('⊗', filterX + 15, filterY + 27);
        
        // Enhanced output visualization
        const outputX = 280 + col * 8;
        const outputY = 60 + row * 8;
        const activation = Math.random() * 0.8 + 0.2;
        
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(16, 185, 129, ${activation})`;
        ctx.fillRect(outputX, outputY, 12, 12);
        ctx.strokeStyle = '#10B981';
        ctx.strokeRect(outputX, outputY, 12, 12);
        ctx.shadowBlur = 0;
        
        // Animated connection line
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.shadowColor = '#0066FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(filterX + 20, filterY + 40);
        ctx.lineTo(outputX + 6, outputY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        
        // Professional progress display
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 16px Inter';
        ctx.fillText(`Processing: ${step + 1}/${maxSteps}`, 120, 260);
        
        // Animated progress bar
        const progressWidth = 200;
        const progressHeight = 12;
        const progressX = 120;
        const progressY = 270;
        
        // Background
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
        
        // Progress fill with gradient
        const gradient = ctx.createLinearGradient(progressX, 0, progressX + progressWidth, 0);
        gradient.addColorStop(0, '#0066FF');
        gradient.addColorStop(1, '#00AADD');
        ctx.fillStyle = gradient;
        ctx.fillRect(progressX, progressY, (progressWidth * (step + 1)) / maxSteps, progressHeight);
        
        // Progress shine effect
        const shineGradient = ctx.createLinearGradient(progressX, 0, progressX + progressWidth, 0);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGradient;
        ctx.fillRect(progressX, progressY, (progressWidth * (step + 1)) / maxSteps, progressHeight);
        
        step = (step + 1) % maxSteps;
        
        const delay = step === 0 ? 1500 : 500;
        const timeoutId = setTimeout(() => {
            if (controller.getAnimationRunning()) animate();
        }, delay);
        
        controller.setAnimationId(timeoutId);
    };
    
    animate();
    return controller;
};

// Replace the original animateConvolution method
CNNVisualization.prototype.animateConvolution = CNNVisualization.prototype.animateConvolutionControllable;

// Enhanced navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth reveal animations for hero content
setTimeout(() => {
    const heroTitle = document.querySelector('.hero-title');
    const heroDesc = document.querySelector('.hero-description');
    const heroBtn = document.querySelector('.hero-buttons');
    
    if (heroTitle) heroTitle.style.animation = 'fadeInUp 1s ease forwards';
    if (heroDesc) heroDesc.style.animation = 'fadeInUp 1s ease 0.3s forwards';
    if (heroBtn) heroBtn.style.animation = 'fadeInUp 1s ease 0.6s forwards';
}, 1500);

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 70; // Navbar height
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function copyCode(button) {
    const pre = button.closest('.code-block').querySelector('pre');
    const code = pre.innerText;
    navigator.clipboard.writeText(code).then(() => {
        button.innerText = 'Copied!';
        setTimeout(() => button.innerText = '📋 Copy', 2000);
    });
}

function openNotebook() {
    window.open('MNIST_with_CNN.ipynb', '_blank');
}

// CNN Animation Class for 3D Hero Animation
class CNNAnimation {
    constructor() {
        this.container = document.getElementById('cnn-animation-container');
        if (!this.container) return;

        try {
            this.init();
            this.createCNN();
            this.animate();
        } catch (error) {
            console.error('Error setting up THREE.js animation:', error);
        }
    }

    init() {
        if (typeof THREE === 'undefined') {
            console.error('THREE.js not loaded');
            return;
        }
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 15;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(5, 10, 15);
        this.scene.add(pointLight);

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    createCNN() {
        this.layers = [];
        const layerSpacing = 4;
        const layerColors = [0x0066FF, 0x00AADD, 0x00EEFF];

        // Input Layer
        const inputLayer = this.createLayer(32, 32, 0.1, layerColors[0]);
        inputLayer.position.x = -layerSpacing * 1.5;
        this.scene.add(inputLayer);
        this.layers.push(inputLayer);

        // Conv/Pool Layers
        for (let i = 0; i < 2; i++) {
            const layer = this.createLayer(20 - i * 8, 20 - i * 8, 1.5, layerColors[1]);
            layer.position.x = -layerSpacing * 0.5 + i * layerSpacing;
            this.scene.add(layer);
            this.layers.push(layer);
        }

        // Dense Layer
        const denseLayer = this.createLayer(1, 10, 0.2, layerColors[2]);
        denseLayer.position.x = layerSpacing * 1.5;
        this.scene.add(denseLayer);
        this.layers.push(denseLayer);
    }

    createLayer(width, height, depth, color) {
        const group = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.8 });

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(
                    (i - width / 2) * 0.2,
                    (j - height / 2) * 0.2,
                    (Math.random() - 0.5) * depth
                );
                group.add(mesh);
            }
        }
        return group;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.layers) {
            this.layers.forEach((layer, index) => {
                layer.rotation.y += 0.001 * (index + 1);
                layer.rotation.x += 0.001 * (index + 1);
            });
        }

        if (this.scene) {
            this.scene.rotation.y += 0.0005;
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}