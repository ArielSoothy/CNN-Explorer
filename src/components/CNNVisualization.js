// CNN Visualization Component
import { Utils, ErrorHandler } from '../js/config.js';

const DIGIT_7 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
const CONV_FILTER = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]; // Vertical Edge Detection

export class CNNVisualization {
    constructor() {
        this.isInitialized = false;
        this.animationFrameId = null;
        this.currentConvStep = 0;
        
        this.inputSize = 28;
        this.filterSize = 3;
        this.convOutputSize = this.inputSize - this.filterSize + 1;
        this.totalConvSteps = this.convOutputSize * this.convOutputSize;
        
        this.fullFeatureMap = this.createConvolutionFeatureMap(this.totalConvSteps);
        this.pooledMap = this.createPoolingMap(this.fullFeatureMap);
        this.flattenedMap = this.pooledMap.flat();
        
        this.classificationProbs = [0.02, 0.05, 0.03, 0.1, 0.04, 0.06, 0.1, 0.6, 0.05, 0.05];
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
    }

    // STEP 0: INPUT
    setupInputCanvas() {
        const ctx = Utils.canvas.getContext('input-canvas');
        if (!ctx) return;
        this.drawGrid(ctx, DIGIT_7, { title: 'Input Image (28x28)', cellSize: 10 });
    }

    // STEP 1: CONVOLUTION
    setupConvolutionCanvas() {
        this.resetConvolution();
    }
    
    playConvolutionAnimation() {
        cancelAnimationFrame(this.animationFrameId);
        this.currentConvStep = 0;
        const animate = () => {
            if (this.currentConvStep >= this.totalConvSteps) {
                this.drawConvolutionStep(this.totalConvSteps);
                return;
            }
            this.drawConvolutionStep(this.currentConvStep);
            this.currentConvStep++;
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }

    resetConvolution() {
        cancelAnimationFrame(this.animationFrameId);
        this.currentConvStep = 0;
        this.drawConvolutionStep(0);
    }

    drawConvolutionStep(step) {
        const ctx = Utils.canvas.getContext('conv-canvas');
        if (!ctx) return;
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);

        const stepX = step % this.convOutputSize;
        const stepY = Math.floor(step / this.convOutputSize);

        this.drawGrid(ctx, DIGIT_7, { title: 'Input', x: 10, y: 50, cellSize: 8, highlight: { x: stepX, y: stepY, w: this.filterSize, h: this.filterSize } });
        this.drawGrid(ctx, CONV_FILTER, { title: 'Filter', x: 250, y: 50, cellSize: 20 });
        this.drawGrid(ctx, this.createConvolutionFeatureMap(step), { title: `Feature Map (Step ${step})`, x: 250, y: 150, cellSize: 8 });
    }

    createConvolutionFeatureMap(untilStep) {
        let featureMap = Array(this.convOutputSize).fill(0).map(() => Array(this.convOutputSize).fill(0));
        for (let i = 0; i < untilStep; i++) {
            const x = i % this.convOutputSize;
            const y = Math.floor(i / this.convOutputSize);
            let sum = 0;
            for (let fy = 0; fy < this.filterSize; fy++) {
                for (let fx = 0; fx < this.filterSize; fx++) {
                    sum += DIGIT_7[y + fy][x + fx] * CONV_FILTER[fy][fx];
                }
            }
            featureMap[y][x] = Math.max(0, sum); // ReLU
        }
        return featureMap;
    }

    // STEP 2: POOLING
    setupPoolingCanvas() {
        const ctx = Utils.canvas.getContext('pooling-canvas');
        if (!ctx) return;
        this.drawGrid(ctx, this.fullFeatureMap, { title: 'Feature Map', x: 10, y: 50, cellSize: 8, highlight: { x: 0, y: 0, w: 2, h: 2 } });
        this.drawGrid(ctx, this.pooledMap, { title: 'After Max Pooling', x: 250, y: 50, cellSize: 16 });
    }
    
    createPoolingMap(featureMap) {
        const poolSize = 2;
        const outputSize = Math.floor(featureMap.length / poolSize);
        let pooledMap = Array(outputSize).fill(0).map(() => Array(outputSize).fill(0));
        for (let y = 0; y < outputSize; y++) {
            for (let x = 0; x < outputSize; x++) {
                const r = [
                    featureMap[y*poolSize][x*poolSize], featureMap[y*poolSize][x*poolSize + 1],
                    featureMap[y*poolSize + 1][x*poolSize], featureMap[y*poolSize + 1][x*poolSize + 1]
                ];
                pooledMap[y][x] = Math.max(...r);
            }
        }
        return pooledMap;
    }

    // STEP 3: CLASSIFICATION
    setupClassificationCanvas() {
        const ctx = Utils.canvas.getContext('classification-canvas');
        if (!ctx) return;
        this.drawClassification(ctx);
    }

    drawClassification(ctx) {
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);
        
        const barWidth = (width - 200) / this.classificationProbs.length;
        this.drawBarChart(ctx, this.classificationProbs, {
            title: 'Output Probabilities',
            x: 100, y: height - 50, barWidth: barWidth, chartHeight: 200
        });

        ctx.font = 'bold 20px "Inter", sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText('Final Prediction: 7', width / 2, 50);
    }
    
    // GENERIC DRAWING HELPERS
    drawGrid(ctx, data, opts) {
        const { x=20, y=50, cellSize=10, title='', highlight=null } = opts;
        const [rows, cols] = [data.length, data[0].length];
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(title, x, y - 20);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const val = data[r][c] || 0;
                if (val > 0) {
                    ctx.fillStyle = `rgba(59, 130, 246, ${Math.min(1, val)})`;
                    ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
                }
            }
        }
        if (highlight) {
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + highlight.x*cellSize, y + highlight.y*cellSize, highlight.w*cellSize, highlight.h*cellSize);
        }
    }

    drawBarChart(ctx, data, opts) {
        const { x, y, barWidth, chartHeight, title } = opts;
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(title, ctx.canvas.width/2, y - chartHeight - 20);
        
        data.forEach((p, i) => {
            const barHeight = p * chartHeight;
            const barX = x + i * barWidth;
            const isPredicted = p === Math.max(...data);
            ctx.fillStyle = isPredicted ? '#4c1d95' : '#a78bfa';
            ctx.fillRect(barX, y - barHeight, barWidth * 0.8, barHeight);
            ctx.fillStyle = isPredicted ? '#4c1d95' : '#555';
            ctx.fillText(i, barX + (barWidth*0.8)/2, y + 20);
        });
    }
}
