// Interactive Demo Component
import { CONFIG, Utils, ErrorHandler } from '../js/config.js';

export class InteractiveDemo {
    constructor() {
        this.isDrawing = false;
        this.lastPoint = { x: 0, y: 0 };
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.setupDrawingCanvas();
            this.setupDrawingControls();
            this.setupVisualizationCanvases();
            this.isInitialized = true;
            console.log('Interactive Demo initialized successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'InteractiveDemo.init');
        }
    }

    setupDrawingCanvas() {
        this.canvas = Utils.safeQuerySelector('#drawing-canvas');
        if (!this.canvas) {
            console.error('Drawing canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        
        // Set up canvas properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 8;
        
        // Clear canvas with white background
        this.clearCanvas();
        
        // Add drawing event listeners
        this.addDrawingEventListeners();
        
        console.log('Drawing canvas setup complete');
    }

    addDrawingEventListeners() {
        if (!this.canvas) return;

        // Mouse events
        Utils.safeAddEventListener(this.canvas, 'mousedown', this.startDrawing.bind(this));
        Utils.safeAddEventListener(this.canvas, 'mousemove', this.draw.bind(this));
        Utils.safeAddEventListener(this.canvas, 'mouseup', this.stopDrawing.bind(this));
        Utils.safeAddEventListener(this.canvas, 'mouseout', this.stopDrawing.bind(this));

        // Touch events for mobile
        Utils.safeAddEventListener(this.canvas, 'touchstart', this.handleTouch.bind(this));
        Utils.safeAddEventListener(this.canvas, 'touchmove', this.handleTouch.bind(this));
        Utils.safeAddEventListener(this.canvas, 'touchend', this.stopDrawing.bind(this));
    }

    getPointFromEvent(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    startDrawing(event) {
        event.preventDefault();
        this.isDrawing = true;
        this.lastPoint = this.getPointFromEvent(event);
    }

    draw(event) {
        if (!this.isDrawing) return;
        
        event.preventDefault();
        const currentPoint = this.getPointFromEvent(event);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
        this.ctx.lineTo(currentPoint.x, currentPoint.y);
        this.ctx.stroke();
        
        this.lastPoint = currentPoint;
        
        // Update visualization in real-time (debounced)
        this.updateVisualizationDebounced();
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    handleTouch(event) {
        event.preventDefault();
        
        switch (event.type) {
            case 'touchstart':
                this.startDrawing(event);
                break;
            case 'touchmove':
                this.draw(event);
                break;
        }
    }

    clearCanvas() {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clear visualization as well
        this.clearVisualization();
    }

    setupDrawingControls() {
        const clearBtn = Utils.safeQuerySelector('#clear-canvas');
        const predictBtn = Utils.safeQuerySelector('#predict-digit');
        
        if (clearBtn) {
            Utils.safeAddEventListener(clearBtn, 'click', () => {
                this.clearCanvas();
            });
        }
        
        if (predictBtn) {
            Utils.safeAddEventListener(predictBtn, 'click', () => {
                this.predictDigit();
            });
        }
    }

    setupVisualizationCanvases() {
        // Setup input visualization canvas
        const vizInput = Utils.safeQuerySelector('#viz-input');
        if (vizInput) {
            const ctx = vizInput.getContext('2d');
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, vizInput.width, vizInput.height);
        }
        
        // Setup feature map containers
        this.setupFeatureMaps();
        
        // Setup probability chart
        this.setupProbabilityChart();
    }

    setupFeatureMaps() {
        const conv1Container = Utils.safeQuerySelector('#conv1-features');
        const pool1Container = Utils.safeQuerySelector('#pool1-features');
        
        if (conv1Container) {
            conv1Container.innerHTML = this.createFeatureMapGrid(8, 'Convolution Features');
        }
        
        if (pool1Container) {
            pool1Container.innerHTML = this.createFeatureMapGrid(8, 'Pooled Features');
        }
    }

    createFeatureMapGrid(count, label) {
        let html = `<div class="feature-map-label">${label}</div><div class="feature-map-items">`;
        
        for (let i = 0; i < count; i++) {
            html += `<div class="feature-map-item">
                <canvas width="32" height="32" id="feature-${label.toLowerCase().replace(' ', '-')}-${i}"></canvas>
            </div>`;
        }
        
        html += '</div>';
        return html;
    }

    setupProbabilityChart() {
        const chartCanvas = Utils.safeQuerySelector('#prob-chart');
        if (!chartCanvas) return;
        
        const ctx = chartCanvas.getContext('2d');
        
        // Draw empty chart
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
        
        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, chartCanvas.height - 40);
        ctx.lineTo(chartCanvas.width - 20, chartCanvas.height - 40);
        ctx.stroke();
        
        // Draw digit labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < 10; i++) {
            const x = 50 + (i * (chartCanvas.width - 70) / 10);
            ctx.fillText(i.toString(), x, chartCanvas.height - 25);
        }
        
        // Y-axis label
        ctx.save();
        ctx.translate(15, chartCanvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Probability', 0, 0);
        ctx.restore();
    }

    // Debounced visualization update
    updateVisualizationDebounced = Utils.debounce(() => {
        this.updateVisualization();
    }, 100);

    updateVisualization() {
        try {
            // Update input visualization
            this.updateInputVisualization();
            
            // Simulate feature map updates
            this.updateFeatureMaps();
            
            console.log('Visualization updated');
        } catch (error) {
            ErrorHandler.handle(error, 'updateVisualization');
        }
    }

    updateInputVisualization() {
        const vizInput = Utils.safeQuerySelector('#viz-input');
        if (!vizInput || !this.canvas) return;
        
        const ctx = vizInput.getContext('2d');
        
        // Scale down the drawing to fit the small visualization canvas
        ctx.drawImage(
            this.canvas, 
            0, 0, this.canvas.width, this.canvas.height,
            0, 0, vizInput.width, vizInput.height
        );
    }

    updateFeatureMaps() {
        // Simulate feature map activations with random patterns
        for (let i = 0; i < 8; i++) {
            const conv1Canvas = Utils.safeQuerySelector(`#feature-convolution-features-${i}`);
            const pool1Canvas = Utils.safeQuerySelector(`#feature-pooled-features-${i}`);
            
            if (conv1Canvas) {
                this.drawRandomFeatureMap(conv1Canvas.getContext('2d'), conv1Canvas.width, conv1Canvas.height);
            }
            
            if (pool1Canvas) {
                this.drawRandomFeatureMap(pool1Canvas.getContext('2d'), pool1Canvas.width, pool1Canvas.height);
            }
        }
    }

    drawRandomFeatureMap(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const intensity = Math.random() * 255;
            imageData.data[i] = intensity;     // Red
            imageData.data[i + 1] = intensity; // Green
            imageData.data[i + 2] = intensity; // Blue
            imageData.data[i + 3] = 255;       // Alpha
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    async predictDigit() {
        try {
            if (!this.canvas) return;
            
            // Show loading state
            const resultDisplay = Utils.safeQuerySelector('.predicted-digit');
            const confidenceDisplay = Utils.safeQuerySelector('.confidence-score');
            
            if (resultDisplay) resultDisplay.textContent = '...';
            if (confidenceDisplay) confidenceDisplay.textContent = 'Analyzing...';
            
            // Simulate prediction delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate random prediction for demo
            const predictedDigit = Math.floor(Math.random() * 10);
            const confidence = Math.floor(Math.random() * 40) + 60; // 60-99%
            
            if (resultDisplay) resultDisplay.textContent = predictedDigit.toString();
            if (confidenceDisplay) confidenceDisplay.textContent = `Confidence: ${confidence}%`;
            
            // Update probability chart
            this.updateProbabilityChart(predictedDigit, confidence);
            
            console.log(`Predicted digit: ${predictedDigit} with ${confidence}% confidence`);
        } catch (error) {
            ErrorHandler.handle(error, 'predictDigit');
        }
    }

    updateProbabilityChart(predictedDigit, confidence) {
        const chartCanvas = Utils.safeQuerySelector('#prob-chart');
        if (!chartCanvas) return;
        
        const ctx = chartCanvas.getContext('2d');
        
        // Clear and redraw chart
        this.setupProbabilityChart();
        
        // Generate random probabilities with bias toward predicted digit
        const probabilities = Array.from({ length: 10 }, (_, i) => {
            if (i === predictedDigit) {
                return confidence / 100;
            } else {
                return Math.random() * (100 - confidence) / 100 / 9;
            }
        });
        
        // Draw bars
        const barWidth = (chartCanvas.width - 70) / 10;
        const maxBarHeight = chartCanvas.height - 80;
        
        probabilities.forEach((prob, i) => {
            const barHeight = prob * maxBarHeight;
            const x = 50 + (i * barWidth);
            const y = chartCanvas.height - 40 - barHeight;
            
            // Color based on whether it's the predicted digit
            ctx.fillStyle = i === predictedDigit ? '#4CAF50' : '#2196F3';
            ctx.fillRect(x - barWidth/3, y, barWidth/1.5, barHeight);
            
            // Add probability text
            ctx.fillStyle = '#333';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${Math.round(prob * 100)}%`, 
                x, 
                y - 5
            );
        });
    }

    clearVisualization() {
        // Clear input visualization
        const vizInput = Utils.safeQuerySelector('#viz-input');
        if (vizInput) {
            const ctx = vizInput.getContext('2d');
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, vizInput.width, vizInput.height);
        }
        
        // Clear prediction results
        const resultDisplay = Utils.safeQuerySelector('.predicted-digit');
        const confidenceDisplay = Utils.safeQuerySelector('.confidence-score');
        
        if (resultDisplay) resultDisplay.textContent = '?';
        if (confidenceDisplay) confidenceDisplay.textContent = 'Confidence: --%';
        
        // Reset probability chart
        this.setupProbabilityChart();
        
        // Clear feature maps
        for (let i = 0; i < 8; i++) {
            const conv1Canvas = Utils.safeQuerySelector(`#feature-convolution-features-${i}`);
            const pool1Canvas = Utils.safeQuerySelector(`#feature-pooled-features-${i}`);
            
            if (conv1Canvas) {
                const ctx = conv1Canvas.getContext('2d');
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, conv1Canvas.width, conv1Canvas.height);
            }
            
            if (pool1Canvas) {
                const ctx = pool1Canvas.getContext('2d');
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, pool1Canvas.width, pool1Canvas.height);
            }
        }
    }
}
