// Enhanced Professional CNN Visualization Component
import { Utils, ErrorHandler } from '../js/config.js';

// Create a more realistic and professional digit pattern
const createProfessionalDigit = () => {
    const image = Array(28*28).fill(0);
    
    // Helper function to draw with anti-aliasing effect
    const drawPixel = (x, y, intensity) => {
        if (x >= 0 && x < 28 && y >= 0 && y < 28) {
            image[y * 28 + x] = Math.max(image[y * 28 + x], intensity);
        }
    };
    
    // Helper to draw thick line with gradient
    const drawThickLine = (x1, y1, x2, y2, thickness = 2, intensity = 255) => {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        let x = x1, y = y1;
        
        while (true) {
            // Draw thick line with gradient effect
            for (let i = -thickness; i <= thickness; i++) {
                for (let j = -thickness; j <= thickness; j++) {
                    const dist = Math.sqrt(i*i + j*j);
                    if (dist <= thickness) {
                        const fadeIntensity = intensity * (1 - dist / thickness);
                        drawPixel(x + i, y + j, fadeIntensity);
                    }
                }
            }
            
            if (x === x2 && y === y2) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    };
    
    // Draw a professional-looking "7"
    drawThickLine(6, 4, 21, 4, 2, 255);    // Top horizontal line
    drawThickLine(21, 4, 21, 8, 2, 255);   // Short vertical
    drawThickLine(21, 8, 8, 23, 2, 255);   // Diagonal line
    
    // Add some subtle shading/depth
    drawThickLine(6, 5, 21, 5, 1, 180);    // Shadow effect
    drawThickLine(20, 8, 7, 23, 1, 180);   // Shadow on diagonal
    
    return image;
};

// Professional filter set with meaningful names and descriptions
const PROFESSIONAL_FILTERS = [
    { name: "Vertical Edge", filter: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], description: "Detects vertical edges and boundaries" },
    { name: "Horizontal Edge", filter: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], description: "Detects horizontal edges and boundaries" },
    { name: "Diagonal Edge ↘", filter: [[-2, -1, 0], [-1, 0, 1], [0, 1, 2]], description: "Detects diagonal edges (top-left to bottom-right)" },
    { name: "Diagonal Edge ↙", filter: [[0, -1, -2], [1, 0, -1], [2, 1, 0]], description: "Detects diagonal edges (top-right to bottom-left)" },
    { name: "Corner Detector", filter: [[1, 1, 1], [1, -8, 1], [1, 1, 1]], description: "Highlights corners and intersections" },
    { name: "Line Detector H", filter: [[-1, -1, -1], [2, 2, 2], [-1, -1, -1]], description: "Detects horizontal lines" },
    { name: "Line Detector V", filter: [[-1, 2, -1], [-1, 2, -1], [-1, 2, -1]], description: "Detects vertical lines" },
    { name: "Laplacian", filter: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]], description: "Edge enhancement filter" },
    { name: "Sharpen", filter: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], description: "Sharpens image details" },
    { name: "Emboss", filter: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], description: "Creates embossed effect" },
    { name: "Blur", filter: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], description: "Smooths and blurs features" },
    { name: "Ridge Detector", filter: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], description: "Detects ridges and peaks" },
    ...Array(20).fill().map((_, i) => ({
        name: `Feature ${i + 13}`,
        filter: Array(3).fill().map((_, y) => 
            Array(3).fill().map((_, x) => 
                Math.floor(Math.sin((i + 12) * 100 + x * 10 + y * 30) * 2.5)
            )
        ),
        description: `Custom feature detector ${i + 13}`
    }))
];

export class CNNVisualization {
    constructor() {
        this.isInitialized = false;
        this.animationFrameId = null;
        this.animationTimer = null;
        this.currentConvStep = 0;
        this.isPlaying = false;
        this.speed = 3;
        
        this.inputSize = 28;
        this.filterSize = 3;
        this.convOutputSize = this.inputSize - this.filterSize + 1;
        this.totalConvSteps = this.convOutputSize * this.convOutputSize;
        
        // Use the professional digit pattern
        this.inputImage = createProfessionalDigit();
        this.currentFilterIndex = 0;
        this.currentFilter = PROFESSIONAL_FILTERS[this.currentFilterIndex];
        
        this.filterPosition = { x: 0, y: 0 };
        this.outputValues = Array(this.convOutputSize * this.convOutputSize).fill(null);
        this.currentResult = 0;
        
        this.fullFeatureMap = this.createConvolutionFeatureMap(this.totalConvSteps);
        this.pooledMap = this.createPoolingMap(this.fullFeatureMap);
        this.flattenedMap = this.pooledMap.flat();
        
        this.classificationProbs = [0.02, 0.05, 0.03, 0.1, 0.04, 0.06, 0.1, 0.6, 0.05, 0.05];
        
        // Multi-filter visualization
        this.sampleFeatureMaps = this.generateSampleFeatureMaps();
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Play/Reset buttons for convolution
        const playBtn = document.getElementById('play-conv');
        const resetBtn = document.getElementById('reset-conv');
        const completeBtn = document.getElementById('complete-conv');
        const filterSelect = document.getElementById('filter-select');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => this.toggleConvolutionAnimation());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetConvolution());
        }
        
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.calculateAllOutputs());
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilterIndex = parseInt(e.target.value);
                this.currentFilter = PROFESSIONAL_FILTERS[this.currentFilterIndex];
                this.resetConvolution();
                this.updateFilterGrid();
            });
        }
        
        // Filter selection buttons (if they exist)
        this.setupFilterSelection();
    }

    setupFilterSelection() {
        // Create professional filter selection UI
        const convContainer = document.querySelector('.conv-animation-container');
        if (convContainer && !document.getElementById('filter-selector')) {
            const filterSelector = document.createElement('div');
            filterSelector.id = 'filter-selector';
            filterSelector.className = 'professional-filter-selector';
            filterSelector.innerHTML = `
                <div class="filter-controls-professional">
                    <div class="filter-info-display">
                        <div class="current-filter-name">${this.currentFilter.name}</div>
                        <div class="current-filter-description">${this.currentFilter.description}</div>
                    </div>
                    <div class="filter-actions">
                        <select id="filter-dropdown" class="professional-select">
                            ${PROFESSIONAL_FILTERS.map((f, i) => `<option value="${i}">${f.name}</option>`).join('')}
                        </select>
                        <button id="fill-map-btn" class="btn-professional btn-secondary">Complete Map</button>
                    </div>
                </div>
            `;
            convContainer.appendChild(filterSelector);
            
            // Add event listeners
            document.getElementById('filter-dropdown').addEventListener('change', (e) => {
                this.currentFilterIndex = parseInt(e.target.value);
                this.currentFilter = PROFESSIONAL_FILTERS[this.currentFilterIndex];
                this.resetConvolution();
                this.updateFilterGrid();
                this.updateFilterInfo();
            });
            
            document.getElementById('fill-map-btn').addEventListener('click', () => {
                this.calculateAllOutputs();
            });
        }
        
        // Generate the professional multi-filter grid
        this.generateProfessionalFilterGrid();
    }

    updateFilterInfo() {
        const nameEl = document.querySelector('.current-filter-name');
        const descEl = document.querySelector('.current-filter-description');
        if (nameEl) nameEl.textContent = this.currentFilter.name;
        if (descEl) descEl.textContent = this.currentFilter.description;
    }

    generateProfessionalFilterGrid() {
        const filterGrid = document.getElementById('filter-grid');
        if (!filterGrid) return;
        
        filterGrid.innerHTML = '';
        filterGrid.className = 'professional-filter-grid';
        
        PROFESSIONAL_FILTERS.forEach((filterObj, index) => {
            const filterItem = document.createElement('div');
            filterItem.className = `professional-filter-item ${index === this.currentFilterIndex ? 'active' : ''}`;
            filterItem.dataset.filterIndex = index;
            
            filterItem.innerHTML = `
                <div class="filter-header">
                    <div class="filter-number">${index + 1}</div>
                    <div class="filter-name">${filterObj.name}</div>
                </div>
                <div class="filter-thumbnail-professional">
                    ${this.generateProfessionalThumbnail(index)}
                </div>
                <div class="filter-activation-level">
                    <div class="activation-bar" style="width: ${Math.random() * 80 + 20}%"></div>
                </div>
            `;
            
            filterItem.addEventListener('click', () => {
                this.currentFilterIndex = index;
                this.currentFilter = PROFESSIONAL_FILTERS[index];
                this.resetConvolution();
                this.updateFilterGrid();
                this.updateFilterInfo();
                
                // Update dropdown if it exists
                const dropdown = document.getElementById('filter-dropdown');
                if (dropdown) {
                    dropdown.value = index;
                }
            });
            
            filterGrid.appendChild(filterItem);
        });
    }

    updateFilterGrid() {
        const filterItems = document.querySelectorAll('.professional-filter-item');
        filterItems.forEach((item, index) => {
            if (index === this.currentFilterIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    generateProfessionalThumbnail(filterIndex) {
        const featureMap = this.sampleFeatureMaps[filterIndex] || [];
        let html = '';
        
        // Generate higher resolution thumbnail (20x20)
        for (let i = 0; i < 20 * 20; i++) {
            const x = Math.floor((i % 20) * 1.3);
            const y = Math.floor((Math.floor(i / 20)) * 1.3);
            const originalIdx = y * 26 + x;
            const value = originalIdx < featureMap.length ? featureMap[originalIdx] : 0;
            
            // Professional color mapping
            let bgColor = '#f8f9fa';
            if (value > 0) {
                const intensity = Math.min(1, value / 300);
                const hue = 210; // Blue hue
                const saturation = 70 + intensity * 30;
                const lightness = 95 - intensity * 40;
                bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            }
            
            html += `<div class="professional-pixel" style="background-color: ${bgColor}"></div>`;
        }
        
        return html;
    }

    // STEP 0: INPUT
    setupInputCanvas() {
        const ctx = Utils.canvas.getContext('input-canvas');
        if (!ctx) return;
        this.drawProfessionalGrid(ctx, this.inputImage, { 
            title: 'Input Image (28×28)', 
            cellSize: 10,
            width: 28,
            height: 28,
            showGrid: true
        });
    }

    // STEP 1: CONVOLUTION
    setupConvolutionCanvas() {
        this.resetConvolution();
    }
    
    toggleConvolutionAnimation() {
        if (this.isPlaying) {
            this.stopConvolutionAnimation();
        } else {
            this.playConvolutionAnimation();
        }
    }
    
    playConvolutionAnimation() {
        if (this.currentConvStep >= this.totalConvSteps) {
            this.resetConvolution();
        }
        
        this.isPlaying = true;
        this.animationStartTime = Date.now(); // Track start time
        this.animationTimer = setInterval(() => {
            this.updateConvolutionStep();
        }, 1000 / this.speed);
    }
    
    stopConvolutionAnimation() {
        this.isPlaying = false;
        if (this.animationTimer) {
            clearInterval(this.animationTimer);
        }
        const playBtn = document.getElementById('play-conv');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play Animation';
            playBtn.classList.remove('playing');
        }
    }

    resetConvolution() {
        this.stopConvolutionAnimation();
        this.currentConvStep = 0;
        this.filterPosition = { x: 0, y: 0 };
        this.outputValues = Array(this.convOutputSize * this.convOutputSize).fill(null);
        this.currentResult = 0;
        this.drawConvolutionStep(0);
    }

    updateConvolutionStep() {
        if (this.currentConvStep >= this.totalConvSteps) {
            this.stopConvolutionAnimation();
            return;
        }
        
        this.drawConvolutionStep(this.currentConvStep);
        this.currentConvStep++;
        
        // Update filter position
        this.filterPosition.x = (this.currentConvStep - 1) % this.convOutputSize;
        this.filterPosition.y = Math.floor((this.currentConvStep - 1) / this.convOutputSize);
    }

    drawConvolutionStep(step) {
        const canvas = document.getElementById('conv-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set optimized scale for the larger 1200x800 canvas
        const SCALE = 16; // Increased for the much larger canvas
        const INPUT_SIZE = 28;
        const FILTER_SIZE = 3;
        const OUTPUT_SIZE = 26;
        
        // Calculate positions to utilize the full canvas width (1200px)
        const inputStartX = 80;
        const inputStartY = 120;
        const filterStartX = 580;
        const filterStartY = 120;
        const outputStartX = 780;
        const outputStartY = 120;
        
        // Calculate current filter position
        const currentX = step % OUTPUT_SIZE;
        const currentY = Math.floor(step / OUTPUT_SIZE);
        
        // Draw main title
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'center';
        ctx.fillText('Live Convolution Process', canvas.width/2, 50);
        
        // Draw section labels with better spacing
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = '#0066FF';
        ctx.textAlign = 'center';
        ctx.fillText('Input Image (28×28)', inputStartX + (INPUT_SIZE * SCALE)/2, 100);
        ctx.fillText('Filter (3×3)', filterStartX + (FILTER_SIZE * SCALE)/2, 100);
        ctx.fillText('Feature Map (26×26)', outputStartX + (OUTPUT_SIZE * SCALE)/2, 100);
        
        // Filter name and description
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(this.currentFilter.name, filterStartX + (FILTER_SIZE * SCALE)/2, 115);
        
        // Draw all components with new larger scale
        this.drawLargeInputImage(ctx, inputStartX, inputStartY, SCALE, currentX, currentY);
        this.drawLargeFilter(ctx, filterStartX, filterStartY, SCALE);
        this.drawLargeOutputMap(ctx, outputStartX, outputStartY, SCALE, currentX, currentY);
        
        // Draw calculation and progress at the bottom
        this.drawLargeCalculation(ctx, 150, inputStartY + (INPUT_SIZE * SCALE) + 80, currentX, currentY);
        this.drawProgressIndicator(ctx, inputStartX, inputStartY + (INPUT_SIZE * SCALE) + 60, step);
    }
    
    drawLargeInputImage(ctx, startX, startY, scale, currentX, currentY) {
        const INPUT_SIZE = 28;
        const FILTER_SIZE = 3;
        
        for (let y = 0; y < INPUT_SIZE; y++) {
            for (let x = 0; x < INPUT_SIZE; x++) {
                const pixelValue = this.inputImage[y * INPUT_SIZE + x];
                const normalizedValue = pixelValue / 255;
                
                // Check if this pixel is under the current filter
                const isUnderFilter = 
                    x >= currentX && x < currentX + FILTER_SIZE &&
                    y >= currentY && y < currentY + FILTER_SIZE;
                
                // Draw pixel
                ctx.fillStyle = `rgb(${pixelValue}, ${pixelValue}, ${pixelValue})`;
                ctx.fillRect(startX + x * scale, startY + y * scale, scale - 1, scale - 1);
                
                // Highlight pixels under filter
                if (isUnderFilter) {
                    ctx.strokeStyle = '#FF0000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(startX + x * scale, startY + y * scale, scale - 1, scale - 1);
                }
            }
        }
        
        // Draw filter position indicator
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 4;
        ctx.strokeRect(
            startX + currentX * scale - 2, 
            startY + currentY * scale - 2, 
            FILTER_SIZE * scale + 3, 
            FILTER_SIZE * scale + 3
        );
    }
    
    drawLargeFilter(ctx, startX, startY, scale) {
        const FILTER_SIZE = 3;
        const filter = this.currentFilter.filter;
        
        for (let y = 0; y < FILTER_SIZE; y++) {
            for (let x = 0; x < FILTER_SIZE; x++) {
                const value = filter[y][x];
                
                // Color based on filter value
                let fillColor;
                if (value > 0) {
                    fillColor = `rgba(0, 255, 0, ${Math.min(value / 2, 1)})`;
                } else if (value < 0) {
                    fillColor = `rgba(255, 0, 0, ${Math.min(Math.abs(value) / 2, 1)})`;
                } else {
                    fillColor = '#f0f0f0';
                }
                
                ctx.fillStyle = fillColor;
                ctx.fillRect(startX + x * scale, startY + y * scale, scale - 1, scale - 1);
                
                // Draw border
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(startX + x * scale, startY + y * scale, scale - 1, scale - 1);
                
                // Draw value text
                ctx.fillStyle = '#000';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(
                    value.toString(), 
                    startX + x * scale + scale/2, 
                    startY + y * scale + scale/2 + 5
                );
            }
        }
    }
    
    drawLargeOutputMap(ctx, startX, startY, scale, currentX, currentY) {
        const OUTPUT_SIZE = 26;
        
        for (let y = 0; y < OUTPUT_SIZE; y++) {
            for (let x = 0; x < OUTPUT_SIZE; x++) {
                const outputIndex = y * OUTPUT_SIZE + x;
                const value = this.outputValues[outputIndex];
                
                let fillColor = '#e5e7eb'; // Default gray for unprocessed
                
                if (value !== null) {
                    const normalizedValue = Math.min(255, Math.max(0, value / 3));
                    if (normalizedValue > 0) {
                        const intensity = Math.min(normalizedValue / 255, 1);
                        fillColor = `rgba(0, ${255 - normalizedValue}, 0, ${0.3 + intensity * 0.7})`;
                    }
                }
                
                ctx.fillStyle = fillColor;
                ctx.fillRect(startX + x * scale, startY + y * scale, scale - 1, scale - 1);
                
                // Highlight current position
                if (x === currentX && y === currentY) {
                    ctx.strokeStyle = '#FF0000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(startX + x * scale, startY + y * scale, scale - 1, scale - 1);
                }
                
                // Add subtle border for processed pixels
                if (value !== null) {
                    ctx.strokeStyle = '#999';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(startX + x * scale, startY + y * scale, scale - 1, scale - 1);
                }
            }
        }
    }
    
    drawLargeCalculation(ctx, startX, startY, currentX, currentY) {
        const filter = this.currentFilter.filter;
        const INPUT_SIZE = 28;
        
        // Calculate the convolution result step by step
        let sum = 0;
        
        for (let fy = 0; fy < 3; fy++) {
            for (let fx = 0; fx < 3; fx++) {
                const imgX = currentX + fx;
                const imgY = currentY + fy;
                const pixelValue = imgX < INPUT_SIZE && imgY < INPUT_SIZE ? 
                    this.inputImage[imgY * INPUT_SIZE + imgX] : 0;
                const filterValue = filter[fy][fx];
                const product = pixelValue * filterValue;
                sum += product;
            }
        }
        
        const result = Math.max(0, sum); // ReLU activation
        
        // Draw larger calculation background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(startX, startY, 700, 140);
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 4;
        ctx.strokeRect(startX, startY, 700, 140);
        
        // Draw calculation text with larger fonts
        ctx.fillStyle = '#2c3e50';
        ctx.font = '18px monospace';
        ctx.textAlign = 'left';
        
        ctx.fillText('Current Calculation Details:', startX + 20, startY + 30);
        ctx.fillText(`Filter Position: (${currentX}, ${currentY})`, startX + 20, startY + 60);
        ctx.fillText(`Convolution Sum = ${sum.toFixed(2)}`, startX + 20, startY + 90);
        ctx.fillText(`After ReLU Activation = ${result.toFixed(2)}`, startX + 20, startY + 120);
        
        // Draw result prominently on the right
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${result.toFixed(1)}`, startX + 670, startY + 85);
        
        // Add visual separator
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX + 520, startY + 20);
        ctx.lineTo(startX + 520, startY + 120);
        ctx.stroke();
    }
    
    drawProgressIndicator(ctx, startX, startY, currentStep) {
        const totalSteps = 26 * 26;
        const progress = currentStep / totalSteps;
        
        // Draw larger progress bar
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(startX, startY, 400, 25);
        
        // Draw progress fill with gradient
        const gradient = ctx.createLinearGradient(startX, startY, startX + 400, startY);
        gradient.addColorStop(0, '#0066FF');
        gradient.addColorStop(1, '#00AADD');
        ctx.fillStyle = gradient;
        ctx.fillRect(startX, startY, 400 * progress, 25);
        
        // Draw progress text
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            `Processing: Step ${currentStep + 1} of ${totalSteps} (${(progress * 100).toFixed(1)}% Complete)`,
            startX + 200, startY + 45
        );
        
        // Add time estimate
        if (this.isPlaying && progress > 0.05) {
            const timeElapsed = Date.now() - (this.animationStartTime || Date.now());
            const estimatedTotal = timeElapsed / progress;
            const timeRemaining = Math.max(0, estimatedTotal - timeElapsed);
            const secondsRemaining = Math.floor(timeRemaining / 1000);
            
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#666';
            ctx.fillText(`Est. ${secondsRemaining}s remaining`, startX + 200, startY + 65);
        }
    }

    calculateCurrentConvolution(position = this.filterPosition) {
        let sum = 0;
        
        for (let fy = 0; fy < 3; fy++) {
            for (let fx = 0; fx < 3; fx++) {
                const imageX = position.x + fx;
                const imageY = position.y + fy;
                
                let pixelValue = 0;
                if (imageX >= 0 && imageX < 28 && imageY >= 0 && imageY < 28) {
                    pixelValue = this.inputImage[imageY * 28 + imageX];
                }
                
                const filterValue = this.currentFilter.filter[fy][fx];
                sum += pixelValue * filterValue;
            }
        }
        
        return Math.max(0, sum / 100); // ReLU with scaling
    }

    calculateAllOutputs() {
        const newOutputValues = Array(this.convOutputSize * this.convOutputSize).fill(null);
        
        for (let y = 0; y < this.convOutputSize; y++) {
            for (let x = 0; x < this.convOutputSize; x++) {
                const result = this.calculateCurrentConvolution({ x, y });
                newOutputValues[y * this.convOutputSize + x] = result;
            }
        }
        
        this.outputValues = newOutputValues;
        this.drawConvolutionStep(this.totalConvSteps);
    }

    createConvolutionFeatureMap(untilStep) {
        let featureMap = Array(this.convOutputSize * this.convOutputSize).fill(null);
        
        for (let i = 0; i < untilStep; i++) {
            const x = i % this.convOutputSize;
            const y = Math.floor(i / this.convOutputSize);
            const result = this.calculateCurrentConvolution({ x, y });
            featureMap[y * this.convOutputSize + x] = result;
        }
        
        return featureMap;
    }

    // STEP 2: POOLING
    setupPoolingCanvas() {
        const ctx = Utils.canvas.getContext('pooling-canvas');
        if (!ctx) return;
        
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);
        
        // Professional gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        const featureMap2D = this.convertTo2D(this.fullFeatureMap, this.convOutputSize);
        this.drawProfessionalGrid(ctx, featureMap2D, { 
            title: 'Feature Map Before Pooling (26×26)', 
            x: 40, 
            y: 80, 
            cellSize: 8,
            width: this.convOutputSize,
            height: this.convOutputSize,
            highlight: { x: 0, y: 0, w: 2, h: 2 },
            isFeatureMap: true
        });
        
        this.drawProfessionalGrid(ctx, this.pooledMap, { 
            title: 'After Max Pooling 2×2 → (13×13)', 
            x: 450, 
            y: 80, 
            cellSize: 16,
            width: this.pooledMap[0].length,
            height: this.pooledMap.length,
            isFeatureMap: true
        });
        
        // Add pooling explanation
        this.drawPoolingExplanation(ctx);
    }
    
    drawPoolingExplanation(ctx) {
        const explanationX = 40;
        const explanationY = 400;
        const explanationWidth = 720;
        const explanationHeight = 120;
        
        // Background panel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.fillRect(explanationX, explanationY, explanationWidth, explanationHeight);
        ctx.strokeRect(explanationX, explanationY, explanationWidth, explanationHeight);
        
        // Title
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillStyle = '#2c3e50';
        ctx.fillText('Max Pooling Process', explanationX + 20, explanationY + 30);
        
        // Explanation text
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillStyle = '#495057';
        ctx.fillText('• Takes maximum value from each 2×2 region', explanationX + 20, explanationY + 55);
        ctx.fillText('• Reduces spatial dimensions: 26×26 → 13×13', explanationX + 20, explanationY + 75);
        ctx.fillText('• Preserves important features while reducing computation', explanationX + 20, explanationY + 95);
        
        // Visual arrow
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(350, 250);
        ctx.lineTo(420, 250);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(415, 245);
        ctx.lineTo(420, 250);
        ctx.lineTo(415, 255);
        ctx.stroke();
    }
    
    convertTo2D(array1D, size) {
        const result = [];
        for (let y = 0; y < size; y++) {
            result[y] = [];
            for (let x = 0; x < size; x++) {
                result[y][x] = array1D[y * size + x] || 0;
            }
        }
        return result;
    }
    
    createPoolingMap(featureMap) {
        const poolSize = 2;
        const inputSize = Math.sqrt(featureMap.length);
        const outputSize = Math.floor(inputSize / poolSize);
        let pooledMap = Array(outputSize).fill(0).map(() => Array(outputSize).fill(0));
        
        for (let y = 0; y < outputSize; y++) {
            for (let x = 0; x < outputSize; x++) {
                const values = [
                    featureMap[y*poolSize * inputSize + x*poolSize],
                    featureMap[y*poolSize * inputSize + x*poolSize + 1],
                    featureMap[(y*poolSize + 1) * inputSize + x*poolSize],
                    featureMap[(y*poolSize + 1) * inputSize + x*poolSize + 1]
                ].filter(v => v !== null && v !== undefined);
                
                pooledMap[y][x] = values.length > 0 ? Math.max(...values) : 0;
            }
        }
        return pooledMap;
    }

    // STEP 3: CLASSIFICATION
    setupClassificationCanvas() {
        const ctx = Utils.canvas.getContext('classification-canvas');
        if (!ctx) return;
        this.drawProfessionalClassification(ctx);
    }

    drawProfessionalClassification(ctx) {
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);
        
        // Professional gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Larger prediction display
        const predictionWidth = 300;
        const predictionHeight = 120;
        const predictionX = width/2 - predictionWidth/2;
        const predictionY = 40;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.fillRect(predictionX, predictionY, predictionWidth, predictionHeight);
        ctx.strokeRect(predictionX, predictionY, predictionWidth, predictionHeight);
        
        ctx.font = 'bold 36px "Inter", sans-serif';
        ctx.fillStyle = '#007bff';
        ctx.textAlign = 'center';
        ctx.fillText('Prediction: 7', width / 2, predictionY + 50);
        
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillStyle = '#28a745';
        ctx.fillText('Confidence: 60%', width / 2, predictionY + 80);
        
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillStyle = '#6c757d';
        ctx.fillText('Neural Network Classification', width / 2, predictionY + 105);
        
        // Larger bar chart
        const barWidth = (width - 160) / this.classificationProbs.length;
        this.drawProfessionalBarChart(ctx, this.classificationProbs, {
            title: 'Output Probabilities for Each Digit (0-9)',
            x: 80, y: height - 80, barWidth: barWidth, chartHeight: 280
        });
        
        // Add explanation panel
        this.drawClassificationExplanation(ctx);
    }
    
    drawClassificationExplanation(ctx) {
        const explanationX = 40;
        const explanationY = 200;
        const explanationWidth = 720;
        const explanationHeight = 100;
        
        // Background panel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.fillRect(explanationX, explanationY, explanationWidth, explanationHeight);
        ctx.strokeRect(explanationX, explanationY, explanationWidth, explanationHeight);
        
        // Title
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'left';
        ctx.fillText('Dense Layer Classification', explanationX + 20, explanationY + 30);
        
        // Explanation text
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillStyle = '#495057';
        ctx.fillText('• Features are flattened into a 1D vector and fed to dense layers', explanationX + 20, explanationY + 55);
        ctx.fillText('• Final layer outputs probabilities for each digit (0-9)', explanationX + 20, explanationY + 75);
        ctx.fillText('• Highest probability determines the predicted digit', explanationX + 20, explanationY + 95);
    }
    
    // PROFESSIONAL DRAWING HELPERS
    drawProfessionalGrid(ctx, data, opts) {
        const { x=20, y=60, cellSize=10, title='', highlight=null, width, height, showGrid=false, isFeatureMap=false } = opts;
        
        // Professional title
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.fillStyle = '#343a40';
        ctx.fillText(title, x, y - 30);
        
        // Subtitle with dimensions
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillStyle = '#6c757d';
        ctx.fillText(`${width}×${height}`, x, y - 10);
        
        // Handle both 1D and 2D data
        const is1D = Array.isArray(data) && !Array.isArray(data[0]);
        const rows = is1D ? height : data.length;
        const cols = is1D ? width : data[0].length;
        
        // Draw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, cols * cellSize, rows * cellSize);
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cols * cellSize, rows * cellSize);
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const val = is1D ? data[r * cols + c] : data[r][c];
                if (val !== null && val !== undefined && val > 0) {
                    if (isFeatureMap) {
                        // Professional feature map coloring
                        const intensity = Math.min(1, val / 50);
                        const hue = 210;
                        const saturation = 70;
                        const lightness = 95 - intensity * 50;
                        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                    } else {
                        // Professional input image coloring
                        const normalizedValue = Math.min(1, val / 255);
                        const grayValue = Math.floor(255 * (1 - normalizedValue));
                        ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
                    }
                    ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
                }
                
                // Optional grid lines
                if (showGrid) {
                    ctx.strokeStyle = '#f1f3f4';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // Professional highlight
        if (highlight) {
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x + highlight.x*cellSize, y + highlight.y*cellSize, highlight.w*cellSize, highlight.h*cellSize);
            ctx.setLineDash([]);
        }
    }

    drawProfessionalFilter(ctx, filter, opts) {
        const { x=20, y=60, title='Filter' } = opts;
        const cellSize = 25;
        
        // Professional title
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.fillStyle = '#343a40';
        ctx.fillText(title, x, y - 30);
        
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillStyle = '#6c757d';
        ctx.fillText('3×3 Kernel', x, y - 10);
        
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const val = filter[r][c];
                
                // Professional color scheme
                if (val < 0) {
                    ctx.fillStyle = '#dc3545'; // Red for negative
                } else if (val > 0) {
                    ctx.fillStyle = '#28a745'; // Green for positive
                } else {
                    ctx.fillStyle = '#f8f9fa'; // Light gray for zero
                }
                
                ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
                
                // Professional border
                ctx.strokeStyle = '#dee2e6';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
                
                // Professional text
                ctx.font = 'bold 14px "Inter", sans-serif';
                ctx.fillStyle = val === 0 ? '#6c757d' : '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(val.toString(), x + c * cellSize + cellSize/2, y + r * cellSize + cellSize/2 + 5);
            }
        }
    }

    drawProfessionalBarChart(ctx, data, opts) {
        const { x, y, barWidth, chartHeight, title } = opts;
        
        // Professional title
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.fillStyle = '#343a40';
        ctx.textAlign = 'center';
        ctx.fillText(title, ctx.canvas.width/2, y - chartHeight - 30);
        
        data.forEach((p, i) => {
            const barHeight = p * chartHeight;
            const barX = x + i * barWidth;
            const isPredicted = p === Math.max(...data);
            
            // Professional gradient
            const gradient = ctx.createLinearGradient(0, y - barHeight, 0, y);
            if (isPredicted) {
                gradient.addColorStop(0, '#007bff');
                gradient.addColorStop(1, '#0056b3');
            } else {
                gradient.addColorStop(0, '#6c757d');
                gradient.addColorStop(1, '#495057');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(barX, y - barHeight, barWidth * 0.8, barHeight);
            
            // Professional labels
            ctx.font = 'bold 12px "Inter", sans-serif';
            ctx.fillStyle = isPredicted ? '#007bff' : '#6c757d';
            ctx.textAlign = 'center';
            ctx.fillText(i, barX + (barWidth*0.8)/2, y + 20);
            
            // Percentage labels
            if (p > 0.1) {
                ctx.font = '10px "Inter", sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`${(p*100).toFixed(0)}%`, barX + (barWidth*0.8)/2, y - barHeight/2);
            }
        });
    }

    // Generate professional sample feature maps
    generateSampleFeatureMaps() {
        const sampleMaps = [];
        
        for (let filterIdx = 0; filterIdx < PROFESSIONAL_FILTERS.length; filterIdx++) {
            const map = Array(this.convOutputSize * this.convOutputSize).fill(0);
            
            // Generate realistic patterns based on filter type
            const filterName = PROFESSIONAL_FILTERS[filterIdx].name.toLowerCase();
            
            if (filterName.includes('vertical')) {
                // Vertical edge pattern
                for (let y = 0; y < this.convOutputSize; y++) {
                    map[y * this.convOutputSize + 7] = 150;
                    map[y * this.convOutputSize + 20] = 150;
                    map[y * this.convOutputSize + 13] = 100; // Button line
                }
            } else if (filterName.includes('horizontal')) {
                // Horizontal edge pattern
                for (let x = 0; x < this.convOutputSize; x++) {
                    map[4 * this.convOutputSize + x] = 150; // Top line
                    map[22 * this.convOutputSize + x] = 80; // Bottom area
                }
            } else if (filterName.includes('diagonal')) {
                // Diagonal pattern
                for (let i = 0; i < 15; i++) {
                    const idx = (4 + i) * this.convOutputSize + (8 + i);
                    if (idx < map.length) map[idx] = 120;
                }
            } else {
                // Generate deterministic but varied patterns
                for (let i = 0; i < 40; i++) {
                    const x = Math.floor(Math.sin(filterIdx * 50 + i * 15) * 10 + 13);
                    const y = Math.floor(Math.cos(filterIdx * 50 + i * 15) * 10 + 13);
                    if (x >= 0 && x < this.convOutputSize && y >= 0 && y < this.convOutputSize) {
                        map[y * this.convOutputSize + x] = Math.floor(Math.abs(Math.sin(filterIdx + i)) * 100 + 50);
                    }
                }
            }
            
            sampleMaps.push(map);
        }
        
        return sampleMaps;
    }
}
