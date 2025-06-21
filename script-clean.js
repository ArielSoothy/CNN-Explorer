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
        }
    }, 1500);
});

class CNNVisualization {
    constructor() {
        this.createSampleData();
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
        console.log('Setting up input canvas');
        const canvas = document.getElementById('input-canvas');
        if (!canvas) {
            console.error('Input canvas not found');
            return;
        }
        
        try {
            const ctx = canvas.getContext('2d');
            
            // Make canvas responsive
            const rect = canvas.getBoundingClientRect();
            const pixelSize = Math.min(canvas.width, canvas.height) / 28;
            
            // Clear canvas
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate center offset for smaller canvases
            const offsetX = (canvas.width - (28 * pixelSize)) / 2;
            const offsetY = (canvas.height - (28 * pixelSize)) / 2;
            
            // Draw the sample digit
            for (let i = 0; i < 28; i++) {
                for (let j = 0; j < 28; j++) {
                    const value = (i < this.sampleDigit.length && j < this.sampleDigit[i].length) 
                        ? this.sampleDigit[i][j] : 0;
                    
                    if (value > 0) {
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(
                            offsetX + j * pixelSize, 
                            offsetY + i * pixelSize, 
                            pixelSize, 
                            pixelSize
                        );
                    }
                    
                    // Add grid lines (only if pixel size is large enough)
                    if (pixelSize > 5) {
                        ctx.strokeStyle = '#e0e0e0';
                        ctx.lineWidth = 0.5;
                        ctx.strokeRect(
                            offsetX + j * pixelSize, 
                            offsetY + i * pixelSize, 
                            pixelSize, 
                            pixelSize
                        );
                    }
                }
            }
            console.log('Input canvas setup complete');
        } catch (error) {
            console.error('Error setting up input canvas:', error);
        }
    }

    setupConvolutionCanvas() {
        const canvas = document.getElementById('conv-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8faff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw input image (smaller version)
        const inputSize = 120;
        const pixelSize = inputSize / 28;
        const startX = 20;
        const startY = 50;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(startX, startY, inputSize, inputSize);
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, inputSize, inputSize);
        
        // Draw the digit "5"
        for (let i = 0; i < 22; i++) {
            for (let j = 0; j < 22; j++) {
                const value = (i < this.sampleDigit.length && j < this.sampleDigit[i].length) 
                    ? this.sampleDigit[i][j] : 0;
                if (value > 0) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(startX + j * pixelSize + 10, startY + i * pixelSize + 10, pixelSize, pixelSize);
                }
            }
        }
        
        // 3x3 Filter
        const filterSize = 60;
        const filterX = 60;
        const filterY = 80;
        
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.fillRect(filterX, filterY, filterSize, filterSize);
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 3;
        ctx.strokeRect(filterX, filterY, filterSize, filterSize);
        
        // Filter pattern
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px monospace';
        const filterValues = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.fillText(filterValues[i][j].toString(), filterX + j * 20 + 5, filterY + i * 20 + 15);
            }
        }
        
        // Output feature map
        const outputSize = 100;
        const outputX = 280;
        const outputY = 60;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(outputX, outputY, outputSize, outputSize);
        ctx.strokeStyle = '#00AA00';
        ctx.lineWidth = 2;
        ctx.strokeRect(outputX, outputY, outputSize, outputSize);
        
        // Draw edge detection result
        this.drawConvolutionResult(ctx, outputX, outputY, outputSize);
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.fillText('Input: Digit "5"', startX, startY - 10);
        ctx.fillText('3x3 Edge Filter', filterX, filterY - 10);
        ctx.fillText('Feature Map', outputX, outputY - 10);
        
        // Arrow
        this.drawArrow(ctx, 150, 115, 270, 115);
        
        ctx.fillStyle = '#0066FF';
        ctx.font = 'bold 14px Inter';
        ctx.fillText('Convolution: Finding Edges in "5"', 120, 280);
    }

    drawConvolutionResult(ctx, startX, startY, size) {
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
                    const intensity = Math.random() * 0.5 + 0.5;
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
        
        // Feature map from convolution
        const gridSize = 12;
        const cellSize = 12;
        const startX = 30;
        const startY = 50;
        
        const featureMap = this.createConvolutionFeatureMap();
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const value = featureMap[i] && featureMap[i][j] ? featureMap[i][j] : 0;
                const intensity = Math.min(1, value + Math.random() * 0.3);
                ctx.fillStyle = `rgba(0, 170, 0, ${intensity})`;
                ctx.fillRect(startX + j * cellSize, startY + i * cellSize, cellSize, cellSize);
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(startX + j * cellSize, startY + i * cellSize, cellSize, cellSize);
            }
        }
        
        // Pooling window
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 4;
        ctx.strokeRect(startX, startY, cellSize * 2, cellSize * 2);
        
        // Arrow
        this.drawArrow(ctx, 200, 115, 240, 115);
        
        // Pooled result
        const pooledSize = 6;
        const pooledCellSize = 18;
        const pooledStartX = 270;
        const pooledStartY = 70;
        
        for (let i = 0; i < pooledSize; i++) {
            for (let j = 0; j < pooledSize; j++) {
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
                ctx.fillStyle = `rgba(0, 100, 170, ${intensity})`;
                ctx.fillRect(pooledStartX + j * pooledCellSize, pooledStartY + i * pooledCellSize, pooledCellSize, pooledCellSize);
                ctx.strokeStyle = '#0066AA';
                ctx.strokeRect(pooledStartX + j * pooledCellSize, pooledStartY + i * pooledCellSize, pooledCellSize, pooledCellSize);
            }
        }
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.fillText('Convolved "5"', startX, startY - 10);
        ctx.fillText('Max Pooled', pooledStartX, pooledStartY - 10);
        
        ctx.fillStyle = '#FF6666';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('2×2 Max Pooling', startX, startY + gridSize * cellSize + 35);
    }

    createConvolutionFeatureMap() {
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

    setupClassificationCanvas() {
        const canvas = document.getElementById('classification-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8faff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Flattened features
        const featureHeight = 12;
        const featureWidth = 180;
        const startY = 60;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, startY, featureWidth, featureHeight);
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, startY, featureWidth, featureHeight);
        
        // Draw feature segments
        const segmentWidth = featureWidth / 36;
        for (let i = 0; i < 36; i++) {
            const intensity = this.getFeatureIntensityForDigit5(i);
            ctx.fillStyle = `rgba(0, 102, 255, ${intensity})`;
            ctx.fillRect(20 + i * segmentWidth, startY + 2, segmentWidth - 1, featureHeight - 4);
        }
        
        // Output nodes
        const nodeRadius = 15;
        const outputStartX = 280;
        const outputStartY = 40;
        const probabilities = [0.01, 0.02, 0.03, 0.02, 0.04, 0.84, 0.02, 0.01, 0.01, 0.00];
        
        // Draw connections
        ctx.strokeStyle = 'rgba(0, 102, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            const nodeY = outputStartY + i * 22;
            ctx.beginPath();
            ctx.moveTo(200, startY + featureHeight/2);
            ctx.lineTo(outputStartX - 20, nodeY);
            ctx.stroke();
        }
        
        // Draw output nodes
        for (let i = 0; i < 10; i++) {
            const nodeY = outputStartY + i * 22;
            const probability = probabilities[i];
            const intensity = 0.3 + probability * 0.7;
            const nodeColor = i === 5 ? '#FF6666' : '#0066FF';
            
            ctx.fillStyle = `${nodeColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(outputStartX, nodeY, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = nodeColor;
            ctx.lineWidth = i === 5 ? 3 : 1;
            ctx.stroke();
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), outputStartX, nodeY + 5);
            
            ctx.fillStyle = '#333';
            ctx.font = '11px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`${(probability * 100).toFixed(1)}%`, outputStartX + 25, nodeY + 4);
        }
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.fillText('Flattened Features', 20, startY - 10);
        ctx.fillText('Output Probabilities', outputStartX - 30, 25);
        
        // Arrow
        this.drawArrow(ctx, 210, startY + featureHeight/2, 250, startY + featureHeight/2);
        
        // Prediction
        ctx.fillStyle = '#FF6666';
        ctx.font = 'bold 18px Inter';
        ctx.fillText('Prediction: 5', 50, 280);
        
        ctx.fillStyle = '#00AA00';
        ctx.font = 'bold 14px Inter';
        ctx.fillText('Confidence: 84.0%', 180, 280);
    }

    getFeatureIntensityForDigit5(index) {
        const pattern = [
            0.8, 0.9, 0.8, 0.7, 0.6, 0.4, 0.2, 0.3, 0.2, 0.1, 0.1, 0.1,
            0.9, 0.8, 0.7, 0.3, 0.2, 0.1, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3,
            0.2, 0.1, 0.2, 0.8, 0.9, 0.8, 0.7, 0.6, 0.8, 0.9, 0.7, 0.6
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
        
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI/6), toY - headLength * Math.sin(angle - Math.PI/6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI/6), toY - headLength * Math.sin(angle + Math.PI/6));
        ctx.stroke();
    }
}

class CNNWebsite {
    constructor() {
        this.visualization = new CNNVisualization();
        this.init();
        this.setupScrollAnimations();
        this.setupInteractiveElements();
    }

    init() {
        this.setupEventListeners();
        // Initialize with step 0 after a small delay to ensure DOM is ready
        setTimeout(() => {
            this.showStep(0);
        }, 100);
    }

    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Step buttons - use event delegation for reliability
        const stepContainer = document.querySelector('.step-navigation');
        if (stepContainer) {
            stepContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('step-btn')) {
                    const step = parseInt(e.target.dataset.step);
                    if (!isNaN(step)) {
                        this.showStep(step);
                    }
                }
            });
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navMenu = document.getElementById('nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuBtn.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
            });
            
            // Close mobile menu when a link is clicked
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.textContent = '☰';
                });
            });
        }

        this.setupInteractiveDemo();
    }

    scrollToSection(sectionId) {
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
    }

    showStep(stepIndex) {
        console.log('Showing step:', stepIndex);
        
        // Remove active class from all panels
        document.querySelectorAll('.step-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Update navigation buttons
        document.querySelectorAll('.step-btn').forEach((btn, index) => {
            btn.classList.toggle('active', index === stepIndex);
        });

        // Show new step with smooth transition
        const newPanel = document.querySelector(`.step-panel[data-step="${stepIndex}"]`);
        if (newPanel) {
            console.log('Found panel for step:', stepIndex);
            // Add a small delay to ensure the previous panel fully hides
            setTimeout(() => {
                newPanel.classList.add('active');
                // Trigger the step animation after the panel is visible
                setTimeout(() => {
                    try {
                        this.triggerStepAnimation(stepIndex);
                    } catch (error) {
                        console.error('Error triggering step animation:', error);
                    }
                }, 100);
            }, 100);
        } else {
            console.error('Panel not found for step:', stepIndex);
        }
    }

    triggerStepAnimation(stepIndex) {
        console.log('Triggering animation for step:', stepIndex);
        try {
            switch(stepIndex) {
                case 0:
                    this.visualization.setupInputCanvas();
                    break;
                case 1:
                    this.visualization.setupConvolutionCanvas();
                    this.setupConvolutionControls();
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

    setupConvolutionControls() {
        const playBtn = document.getElementById('play-conv');
        const resetBtn = document.getElementById('reset-conv');
        
        if (playBtn) {
            playBtn.onclick = () => {
                this.animateConvolution();
                playBtn.disabled = true;
                playBtn.textContent = '▶ Playing...';
                setTimeout(() => {
                    playBtn.disabled = false;
                    playBtn.textContent = '▶ Play Animation';
                }, 5000);
            };
        }
        
        if (resetBtn) {
            resetBtn.onclick = () => {
                this.visualization.setupConvolutionCanvas();
            };
        }
    }

    animateConvolution() {
        const canvas = document.getElementById('conv-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let step = 0;
        const maxSteps = 25;
        let animationRunning = true;
        
        const visualization = this.visualization; // Store reference
        
        const animate = () => {
            if (!animationRunning) return;
            
            visualization.setupConvolutionCanvas();
            
            const startX = 30;
            const startY = 60;
            const stepSize = 12;
            const gridSize = 5;
            
            const row = Math.floor(step / gridSize);
            const col = step % gridSize;
            
            const filterX = startX + col * stepSize;
            const filterY = startY + row * stepSize;
            
            // Animated filter
            const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.01);
            ctx.shadowColor = '#FF6666';
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
            ctx.fillRect(filterX, filterY, 40, 40);
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(filterX, filterY, 40, 40);
            
            // Show output activation
            const outputX = 280 + col * 8;
            const outputY = 60 + row * 8;
            const activation = Math.random() * 0.8 + 0.2;
            
            ctx.fillStyle = `rgba(0, 170, 0, ${activation})`;
            ctx.fillRect(outputX, outputY, 12, 12);
            
            step = (step + 1) % maxSteps;
            
            if (step === 0) {
                setTimeout(animate, 1000);
            } else {
                setTimeout(animate, 300);
            }
        };
        
        setTimeout(() => {
            animationRunning = false;
        }, 15000);
        
        animate();
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

        document.querySelectorAll('.section-title, .section-subtitle, .intro-text, .intro-visual, .app-card').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    setupInteractiveElements() {
        // Enhanced button interactions
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    setupInteractiveDemo() {
        const canvas = document.getElementById('drawing-canvas');
        if (!canvas) {
            console.warn('Drawing canvas not found');
            return;
        }
        
        console.log('Setting up interactive demo canvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        const clearCanvas = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const startDrawing = (e) => {
            isDrawing = true;
            draw(e);
        };

        const stopDrawing = () => {
            isDrawing = false;
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
        };

        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch support
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

        // Button controls
        const clearBtn = document.getElementById('clear-canvas');
        const predictBtn = document.getElementById('predict-digit');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                clearCanvas();
                this.resetPrediction();
            });
        } else {
            console.warn('Clear button not found');
        }

        if (predictBtn) {
            predictBtn.addEventListener('click', () => {
                this.animatedPrediction();
            });
        } else {
            console.warn('Predict button not found');
        }

        // Initialize with clean canvas
        clearCanvas();
        console.log('Interactive demo setup complete');
    }

    resetPrediction() {
        const digitDisplay = document.querySelector('.predicted-digit');
        const confidenceDisplay = document.querySelector('.confidence-score');
        if (digitDisplay) digitDisplay.textContent = '?';
        if (confidenceDisplay) confidenceDisplay.textContent = 'Confidence: --%';
    }

    animatedPrediction() {
        const digitDisplay = document.querySelector('.predicted-digit');
        const confidenceDisplay = document.querySelector('.confidence-score');
        
        if (!digitDisplay || !confidenceDisplay) return;
        
        digitDisplay.textContent = '...';
        
        setTimeout(() => {
            const prediction = Math.floor(Math.random() * 10);
            const confidence = (Math.random() * 20 + 80).toFixed(1);
            
            digitDisplay.textContent = prediction;
            confidenceDisplay.textContent = `Confidence: ${confidence}%`;
        }, 2000);
    }
}

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

// Utility functions
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
        const offset = 70;
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
    if (pre) {
        const code = pre.innerText;
        navigator.clipboard.writeText(code).then(() => {
            button.innerText = 'Copied!';
            setTimeout(() => button.innerText = '📋 Copy', 2000);
        });
    }
}

function openNotebook() {
    window.open('MNIST_with_CNN.ipynb', '_blank');
}
