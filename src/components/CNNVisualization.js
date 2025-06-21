// CNN Visualization Component
import { CONFIG, Utils, ErrorHandler } from '../js/config.js';

export class CNNVisualization {
    constructor() {
        this.sampleDigit = this.createSampleData();
        this.isInitialized = false;
    }

    createSampleData() {
        // Create a sample digit "5" for demonstration
        return [
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
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.setupInputCanvas();
            this.setupConvolutionCanvas();
            this.setupPoolingCanvas();
            this.setupClassificationCanvas();
            this.isInitialized = true;
            console.log('CNN Visualization initialized successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'CNNVisualization.init');
        }
    }

    setupInputCanvas() {
        console.log('Setting up input canvas');
        const canvas = Utils.safeQuerySelector('#input-canvas');
        if (!canvas) {
            console.error('Input canvas not found');
            return;
        }
        
        try {
            const ctx = canvas.getContext('2d');
            const pixelSize = Math.min(canvas.width, canvas.height) / 28;
            
            // Clear canvas with white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate center offset
            const offsetX = (canvas.width - (28 * pixelSize)) / 2;
            const offsetY = (canvas.height - (28 * pixelSize)) / 2;
            
            // Draw the sample digit
            for (let i = 0; i < 28; i++) {
                for (let j = 0; j < 28; j++) {
                    const value = (i < this.sampleDigit.length && j < this.sampleDigit[i].length) 
                        ? this.sampleDigit[i][j] : 0;
                    
                    if (value > 0) {
                        Utils.canvas.drawPixel(
                            ctx,
                            offsetX + j * pixelSize,
                            offsetY + i * pixelSize,
                            pixelSize,
                            '#000000'
                        );
                    }
                }
            }
            
            console.log('Input canvas setup complete');
        } catch (error) {
            ErrorHandler.handle(error, 'setupInputCanvas');
        }
    }

    setupConvolutionCanvas() {
        const canvas = Utils.safeQuerySelector('#conv-canvas');
        if (!canvas) return;
        
        try {
            const ctx = canvas.getContext('2d');
            
            // Clear canvas with light background
            ctx.fillStyle = '#f8faff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw input digit "5" pattern
            this.drawInputDigitForConvolution(ctx, 30, 60, 140);
            
            // Draw filter
            this.drawConvolutionFilter(ctx, 30, 60);
            
            // Draw result area
            this.drawConvolutionResult(ctx, 280, 60, 100);
            
            // Add title
            ctx.fillStyle = '#0066FF';
            ctx.font = 'bold 14px Inter';
            ctx.fillText('Convolution: Finding Edges in "5"', 120, 280);
            
            console.log('Convolution canvas setup complete');
        } catch (error) {
            ErrorHandler.handle(error, 'setupConvolutionCanvas');
        }
    }

    drawInputDigitForConvolution(ctx, startX, startY, size) {
        const pixelSize = size / 28;
        
        // Draw the sample digit with grid
        for (let i = 0; i < 28; i++) {
            for (let j = 0; j < 28; j++) {
                const value = (i < this.sampleDigit.length && j < this.sampleDigit[i].length) 
                    ? this.sampleDigit[i][j] : 0;
                
                ctx.fillStyle = value > 0 ? '#333' : '#fff';
                ctx.fillRect(startX + j * pixelSize, startY + i * pixelSize, pixelSize, pixelSize);
                
                // Light grid lines
                ctx.strokeStyle = '#eee';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(startX + j * pixelSize, startY + i * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    drawConvolutionFilter(ctx, startX, startY) {
        // Static 3x3 edge detection filter
        const filter = [
            [-1, -1, -1],
            [ 0,  0,  0],
            [ 1,  1,  1]
        ];
        
        const filterSize = 40;
        const cellSize = filterSize / 3;
        const filterX = startX + 70;
        const filterY = startY + 40;
        
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 2;
        ctx.strokeRect(filterX, filterY, filterSize, filterSize);
        
        // Draw filter values
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const value = filter[i][j];
                ctx.fillStyle = value > 0 ? '#00AA00' : value < 0 ? '#AA0000' : '#666';
                ctx.fillText(value.toString(), 
                    filterX + j * cellSize + cellSize/2, 
                    filterY + i * cellSize + cellSize/2 + 4);
            }
        }
        
        ctx.textAlign = 'left';
        
        // Arrow pointing to result
        this.drawArrow(ctx, filterX + filterSize + 10, filterY + filterSize/2, 260, filterY + filterSize/2);
    }

    drawConvolutionResult(ctx, startX, startY, size) {
        // Create edge detection result pattern
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
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.fillText('Feature Map', startX, startY - 10);
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

    setupPoolingCanvas() {
        const canvas = Utils.safeQuerySelector('#pooling-canvas');
        if (!canvas) return;
        
        try {
            const ctx = canvas.getContext('2d');
            
            // Clear canvas with light background
            ctx.fillStyle = '#f8faff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw feature map from convolution
            const gridSize = 12;
            const cellSize = 12;
            const startX = 30;
            const startY = 50;
            
            const featureMap = this.createConvolutionFeatureMap();
            
            // Draw original feature map
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
            
            // Highlight 2x2 pooling window
            ctx.strokeStyle = '#FF6666';
            ctx.lineWidth = 4;
            ctx.strokeRect(startX, startY, cellSize * 2, cellSize * 2);
            
            // Arrow
            this.drawArrow(ctx, 200, 115, 240, 115);
            
            // Draw pooled result
            const pooledSize = 6;
            const pooledCellSize = 18;
            const pooledStartX = 270;
            const pooledStartY = 70;
            
            for (let i = 0; i < pooledSize; i++) {
                for (let j = 0; j < pooledSize; j++) {
                    const origI = i * 2;
                    const origJ = j * 2;
                    let maxVal = 0;
                    
                    // Find max value in 2x2 window
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
            ctx.fillText('Feature Map', startX, startY - 10);
            ctx.fillText('Max Pooled (2x2)', pooledStartX, pooledStartY - 10);
            
            // Description
            ctx.fillStyle = '#0066FF';
            ctx.font = 'bold 14px Inter';
            ctx.fillText('Max Pooling: Taking the strongest signal', 90, 280);
            
            console.log('Pooling canvas setup complete');
        } catch (error) {
            ErrorHandler.handle(error, 'setupPoolingCanvas');
        }
    }

    createConvolutionFeatureMap() {
        // Create a realistic feature map based on the digit "5"
        const map = [];
        for (let i = 0; i < 12; i++) {
            map[i] = [];
            for (let j = 0; j < 12; j++) {
                // Create edge-like pattern for the digit 5
                if ((i === 2 || i === 3) && j >= 2 && j <= 8) {
                    map[i][j] = 0.8; // Top horizontal edge
                } else if ((i === 5 || i === 6) && j >= 2 && j <= 6) {
                    map[i][j] = 0.7; // Middle horizontal edge
                } else if ((i === 9 || i === 10) && j >= 3 && j <= 7) {
                    map[i][j] = 0.8; // Bottom horizontal edge
                } else if (j === 2 && i >= 2 && i <= 6) {
                    map[i][j] = 0.6; // Left vertical edge
                } else if (j === 8 && i >= 6 && i <= 10) {
                    map[i][j] = 0.6; // Right vertical edge
                } else {
                    map[i][j] = Math.random() * 0.3; // Background noise
                }
            }
        }
        return map;
    }

    setupClassificationCanvas() {
        const canvas = Utils.safeQuerySelector('#classification-canvas');
        if (!canvas) return;
        
        try {
            const ctx = canvas.getContext('2d');
            
            // Clear canvas with light background
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw flattened features
            const featureHeight = 80;
            const startX = 30;
            const startY = 60;
            
            for (let i = 0; i < 36; i++) {
                const intensity = this.getFeatureIntensityForDigit5(i);
                const barHeight = intensity * featureHeight;
                
                ctx.fillStyle = `rgba(70, 130, 180, ${intensity})`;
                ctx.fillRect(startX + i * 4, startY + featureHeight - barHeight, 3, barHeight);
            }
            
            // Label
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.fillText('Flattened Features', startX, startY - 10);
            
            // Arrow
            this.drawArrow(ctx, 210, startY + featureHeight/2, 250, startY + featureHeight/2);
            
            // Neural network visualization
            this.drawMiniNeuralNetwork(ctx, 260, startY);
            
            // Final prediction
            ctx.fillStyle = '#FF6666';
            ctx.font = 'bold 18px Inter';
            ctx.fillText('Prediction: 5', 50, 280);
            
            ctx.fillStyle = '#00AA00';
            ctx.font = 'bold 14px Inter';
            ctx.fillText('Confidence: 84.0%', 180, 280);
            
            console.log('Classification canvas setup complete');
        } catch (error) {
            ErrorHandler.handle(error, 'setupClassificationCanvas');
        }
    }

    getFeatureIntensityForDigit5(index) {
        // Realistic feature pattern for digit "5"
        const pattern = [
            0.8, 0.9, 0.8, 0.7, 0.6, 0.4, 0.2, 0.3, 0.2, 0.1, 0.1, 0.1,
            0.9, 0.8, 0.7, 0.3, 0.2, 0.1, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3,
            0.2, 0.1, 0.2, 0.8, 0.9, 0.8, 0.7, 0.6, 0.8, 0.9, 0.7, 0.6
        ];
        return pattern[index] || Math.random() * 0.3;
    }

    drawMiniNeuralNetwork(ctx, startX, startY) {
        const neurons = [
            { x: startX, y: startY + 20, active: 0.3 },
            { x: startX, y: startY + 40, active: 0.7 },
            { x: startX, y: startY + 60, active: 0.5 },
            { x: startX + 60, y: startY + 30, active: 0.2 },
            { x: startX + 60, y: startY + 50, active: 0.9 } // Output for "5"
        ];
        
        // Draw connections
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            for (let j = 3; j < 5; j++) {
                ctx.beginPath();
                ctx.moveTo(neurons[i].x + 8, neurons[i].y);
                ctx.lineTo(neurons[j].x - 8, neurons[j].y);
                ctx.stroke();
            }
        }
        
        // Draw neurons
        neurons.forEach((neuron, index) => {
            const radius = 8;
            const intensity = neuron.active;
            
            ctx.fillStyle = `rgba(70, 130, 180, ${intensity})`;
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Highlight the "5" output neuron
            if (index === 4) {
                ctx.strokeStyle = '#FF6666';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '10px Inter';
        ctx.fillText('Hidden', startX - 20, startY + 10);
        ctx.fillText('Output', startX + 45, startY + 20);
        ctx.fillText('(digit 5)', startX + 40, startY + 75);
    }

    // Animation methods
    async playConvolutionAnimation() {
        const canvas = Utils.safeQuerySelector('#conv-canvas');
        const statusIndicator = Utils.safeQuerySelector('#conv-status');
        
        if (!canvas) return;
        
        try {
            const ctx = canvas.getContext('2d');
            let step = 0;
            const maxSteps = 25;
            let animationRunning = true;
            
            if (statusIndicator) {
                statusIndicator.textContent = 'Running convolution animation...';
            }
            
            const animate = () => {
                if (!animationRunning) return;
                
                // Redraw base canvas
                this.setupConvolutionCanvas();
                
                const startX = 30;
                const startY = 60;
                const stepSize = 12;
                const gridSize = 5;
                
                const row = Math.floor(step / gridSize);
                const col = step % gridSize;
                
                const filterX = startX + col * stepSize;
                const filterY = startY + row * stepSize;
                
                // Animated pulsing filter with shadow
                const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.01);
                ctx.shadowColor = '#FF6666';
                ctx.shadowBlur = 10;
                ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
                ctx.fillRect(filterX, filterY, 40, 40);
                ctx.shadowBlur = 0;
                
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 3;
                ctx.strokeRect(filterX, filterY, 40, 40);
                
                // Show animated output activation
                const outputX = 280 + col * 8;
                const outputY = 60 + row * 8;
                const activation = Math.random() * 0.8 + 0.2;
                
                // Glow effect for output
                ctx.shadowColor = '#00AA00';
                ctx.shadowBlur = 5;
                ctx.fillStyle = `rgba(0, 170, 0, ${activation})`;
                ctx.fillRect(outputX, outputY, 12, 12);
                ctx.shadowBlur = 0;
                
                // Add connecting line animation
                ctx.strokeStyle = `rgba(0, 102, 255, ${pulse})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(filterX + 20, filterY + 20);
                ctx.lineTo(outputX + 6, outputY + 6);
                ctx.stroke();
                
                step = (step + 1) % maxSteps;
                
                if (step === 0) {
                    setTimeout(animate, 1000); // Pause at end
                } else {
                    setTimeout(animate, 300); // Normal speed
                }
            };
            
            // Stop animation after 15 seconds
            setTimeout(() => {
                animationRunning = false;
                if (statusIndicator) {
                    statusIndicator.textContent = 'Animation complete! Filter found edges.';
                }
            }, 15000);
            
            animate();
            
        } catch (error) {
            ErrorHandler.handle(error, 'playConvolutionAnimation');
        }
    }

    resetConvolution() {
        this.setupConvolutionCanvas();
        const statusIndicator = Utils.safeQuerySelector('#conv-status');
        if (statusIndicator) {
            statusIndicator.textContent = '';
        }
    }
}
