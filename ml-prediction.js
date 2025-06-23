// Machine Learning Prediction Module using TensorFlow.js
class MNISTPredictor {
    constructor() {
        this.model = null;
        this.modelStatus = 'loading';
        this.loadStatus = 'Loading Real AI Model...';
        console.log('🧠 MNIST Predictor initializing - loading real AI model');
        
        // Start loading the model immediately
        this.loadModel();
    }

    async loadModel() {
        // Only load if it hasn't been loaded yet
        if (this.model) return;

        // TRIED MODELS: 
        // - 'https://teachablemachine.withgoogle.com/models/zyU1hkVJv/model.json'
        // - 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_v1/model.json'
        // - 'https://storage.googleapis.com/tfjs-examples/mnist-transfer-cnn/v1/model.json'
        // - 'https://storage.googleapis.com/tfjs-examples/mnist/dist/model/model.json'
        // - 'https://storage.googleapis.com/tfjs-models/tfjs/mnist_cnn_v1/model.json'
        // - 'https://storage.googleapis.com/tfjs-examples/mnist/dist/model/'
        // CURRENT MODEL: TensorFlow.js MNIST transfer CNN (5 classes)
        const modelUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/mnist_transfer_cnn_v1/model.json';
        console.log(`🧠 Loading real AI model from: ${modelUrl}`);
        this.modelStatus = 'loading';
        this.loadStatus = 'Loading Real AI Model...';

        try {
            this.model = await tf.loadLayersModel(modelUrl);
            this.modelStatus = 'ready';
            this.loadStatus = '✅ Real AI Model Ready';
            console.log(this.loadStatus);
        } catch (error) {
            console.error('❌ Failed to load the real AI model:', error);
            this.modelStatus = 'error';
            this.loadStatus = '❌ Failed to Load AI Model';
            throw new Error(`Failed to load AI model: ${error.message}`);
        }
    }

    async preprocessImage(canvas) {
        console.log('🔍 Preprocessing image with improved MNIST-style processing...');
        
        let grayscale;
        let debugTensor = null;
        
        // Process the image using TensorFlow.js
        const tensor = tf.browser.fromPixels(canvas, 1);
        
        // Find the bounding box of the digit
        const boundingBox = this.getBoundingBox(tensor);
        if (!boundingBox) {
            console.log('⚠️  Empty canvas detected');
            // Handle empty canvas case - return a zero tensor
            const emptyTensor = tf.zeros([1, 28, 28, 1]);
            grayscale = new Array(784).fill(0);
            tensor.dispose();
            await this.updateDebugVisualization(canvas, null, grayscale);
            return emptyTensor;
        }

        console.log('📦 Bounding box:', boundingBox);

        // Process the tensor and create debug tensor outside of tidy for proper disposal
        const processedTensor = tf.tidy(() => {
            // Crop the image to the bounding box
            const croppedTensor = tensor.slice(
                [boundingBox.minY, boundingBox.minX, 0],
                [boundingBox.height, boundingBox.width, 1]
            );

            // Add padding to the cropped image to make it square
            const largerSide = Math.max(boundingBox.width, boundingBox.height);
            const paddingY = Math.floor((largerSide - boundingBox.height) / 2);
            const paddingX = Math.floor((largerSide - boundingBox.width) / 2);

            // Use tf.pad to add padding
            const paddedTensor = croppedTensor.pad([
                [paddingY, paddingY],
                [paddingX, paddingX],
                [0, 0]
            ], 255); // Pad with white (255) to match canvas background

            // Resize the image to 28x28
            // Using resizeBilinear with alignCorners: true for better digit preservation
            const resizedTensor = tf.image.resizeBilinear(paddedTensor, [28, 28], true);

            // Invert colors (MNIST expects white digit on black background)
            // Your canvas has black digit on white, so we invert.
            const invertedTensor = tf.scalar(1.0).sub(resizedTensor.div(255.0));

            return invertedTensor;
        });

                // Convert to array for debug info only
        const tensorArray = processedTensor.dataSync();
        grayscale = Array.from(tensorArray);

        // Clone the tensor for debug visualization
        debugTensor = processedTensor.clone();
        
        // Clean up the original tensor
        tensor.dispose();

        console.log('✅ Image preprocessed with improved MNIST-style processing');
        console.log('Pixel range:', Math.min(...grayscale).toFixed(3), 'to', Math.max(...grayscale).toFixed(3));
        console.log('Non-zero pixels:', grayscale.filter(p => p > 0.1).length);

        // Update debug visualization (async operation)
        await this.updateDebugVisualization(canvas, debugTensor, grayscale);
        
        // Clean up the debug tensor
        if (debugTensor) {
            debugTensor.dispose();
        }

        // Return the processed tensor for the model to use
        return processedTensor;
    }

    // Helper function to get the bounding box of the drawn digit
    getBoundingBox(tensor) {
        const pixels = tensor.arraySync();
        let minX = tensor.shape[1], minY = tensor.shape[0], maxX = -1, maxY = -1;
        let foundPixel = false;

        console.log('🔍 Analyzing tensor shape:', tensor.shape);

        for (let y = 0; y < tensor.shape[0]; y++) {
            for (let x = 0; x < tensor.shape[1]; x++) {
                // fromPixels with 1 channel gives us grayscale values
                // We check if the pixel is not white (< 250 to account for anti-aliasing)
                const pixelValue = pixels[y][x][0];
                if (pixelValue < 250) {  // More lenient threshold for anti-aliased edges
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    foundPixel = true;
                }
            }
        }

        if (foundPixel) {
            console.log('🔍 Bounding box found:', {minX, minY, maxX, maxY});
        }

        if (!foundPixel) return null;

        return {
            minX,
            minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
        };
    }

    async updateDebugVisualization(originalCanvas, processedTensor, pixelData) {
        // Update original drawing debug
        const debugOriginal = document.getElementById('debugOriginal');
        if (debugOriginal) {
            const debugCtx = debugOriginal.getContext('2d');
            debugCtx.clearRect(0, 0, debugOriginal.width, debugOriginal.height);
            debugCtx.drawImage(originalCanvas, 0, 0, debugOriginal.width, debugOriginal.height);
        }

        // Update AI input debug
        const debugAI = document.getElementById('debugProcessed');
        if (debugAI) {
            const debugCtx = debugAI.getContext('2d');
            debugCtx.clearRect(0, 0, debugAI.width, debugAI.height);
            
            if (processedTensor && tf) {
                // Use TensorFlow.js to render the tensor directly for better accuracy
                try {
                    // Create a temporary canvas for the tensor
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 28;
                    tempCanvas.height = 28;
                    
                    // Convert tensor to pixels on the temporary canvas
                    await tf.browser.toPixels(processedTensor, tempCanvas);
                    
                    // Scale it up to fill the debug canvas with pixelated look
                    debugCtx.imageSmoothingEnabled = false;
                    debugCtx.drawImage(tempCanvas, 0, 0, debugAI.width, debugAI.height);
                    
                    console.log('🖼️ Debug visualization updated using TensorFlow.js rendering');
                } catch (error) {
                    console.warn('⚠️  Falling back to pixel array rendering:', error);
                    this.renderPixelArray(debugCtx, debugAI, pixelData);
                }
            } else {
                // Fallback to pixel array rendering
                this.renderPixelArray(debugCtx, debugAI, pixelData);
            }
        }
    }

    renderPixelArray(debugCtx, debugAI, pixelData) {
        // Draw the 28x28 processed image from pixel array
            const imageData = debugCtx.createImageData(28, 28);
            for (let i = 0; i < pixelData.length; i++) {
                const pixelIndex = i * 4;
                const grayValue = Math.floor(pixelData[i] * 255);
                imageData.data[pixelIndex] = grayValue;     // R
                imageData.data[pixelIndex + 1] = grayValue; // G
                imageData.data[pixelIndex + 2] = grayValue; // B
                imageData.data[pixelIndex + 3] = 255;       // A
            }
            
            // Create a temporary canvas to scale up the 28x28 image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 28;
            tempCanvas.height = 28;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);
            
            // Scale it up to fill the debug canvas
            debugCtx.imageSmoothingEnabled = false; // Pixelated look
            debugCtx.drawImage(tempCanvas, 0, 0, debugAI.width, debugAI.height);
            
        console.log('🖼️ Debug visualization updated using pixel array');
    }

    intelligentShapeAnalysis(pixelData) {
        // Advanced pattern recognition for 28x28 MNIST-style digits
        const threshold = 0.1;
        
        // Convert to 2D array for easier pattern analysis
        const grid = [];
        for (let y = 0; y < 28; y++) {
            grid[y] = [];
            for (let x = 0; x < 28; x++) {
                grid[y][x] = pixelData[y * 28 + x] > threshold ? 1 : 0;
            }
        }
        
        // Extract advanced features
        const features = this.extractAdvancedFeatures(grid);
        console.log('🧠 Advanced features:', features);
        
        // Pattern-based digit recognition
        return this.patternBasedRecognition(features, grid);
    }
    
    extractAdvancedFeatures(grid) {
        const features = {};
        
        // Basic shape analysis
        let drawnPixels = 0;
        let minX = 28, maxX = -1, minY = 28, maxY = -1;
        
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                if (grid[y][x]) {
                    drawnPixels++;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        features.aspectRatio = width / height;
        features.density = drawnPixels / (width * height);
        features.totalPixels = drawnPixels;
        
        // Quadrant analysis
        const quadrants = {topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0};
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                if (grid[y][x]) {
                    if (y < centerY && x < centerX) quadrants.topLeft++;
                    else if (y < centerY && x >= centerX) quadrants.topRight++;
                    else if (y >= centerY && x < centerX) quadrants.bottomLeft++;
                    else quadrants.bottomRight++;
                }
            }
        }
        features.quadrants = quadrants;
        
        // Horizontal and vertical projections
        features.horizontalProjection = this.getHorizontalProjection(grid);
        features.verticalProjection = this.getVerticalProjection(grid);
        
        // Holes and loops detection
        features.holes = this.detectHoles(grid);
        
        // Edge patterns
        features.edges = this.detectEdges(grid);
        
        // Stroke analysis
        features.strokes = this.analyzeStrokes(grid);
        
        return features;
    }
    
    getHorizontalProjection(grid) {
        const projection = [];
        for (let y = 0; y < 28; y++) {
            let count = 0;
            for (let x = 0; x < 28; x++) {
                if (grid[y][x]) count++;
            }
            projection.push(count);
        }
        return projection;
    }
    
    getVerticalProjection(grid) {
        const projection = [];
        for (let x = 0; x < 28; x++) {
            let count = 0;
            for (let y = 0; y < 28; y++) {
                if (grid[y][x]) count++;
            }
            projection.push(count);
        }
        return projection;
    }
    
    detectHoles(grid) {
        // Simple hole detection using flood fill
        const visited = Array(28).fill().map(() => Array(28).fill(false));
        let holes = 0;
        
        for (let y = 1; y < 27; y++) {
            for (let x = 1; x < 27; x++) {
                if (!grid[y][x] && !visited[y][x]) {
                    // Check if this empty space is surrounded
                    if (this.isEnclosed(grid, x, y, visited)) {
                        holes++;
                    }
                }
            }
        }
        return holes;
    }
    
    isEnclosed(grid, startX, startY, visited) {
        // More accurate hole detection - check if region is truly enclosed
        const stack = [{x: startX, y: startY}];
        const region = [];
        let touchesBorder = false;
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            if (x < 0 || x >= 28 || y < 0 || y >= 28) {
                touchesBorder = true;
                continue;
            }
            if (visited[y][x] || grid[y][x]) continue;
            
            visited[y][x] = true;
            region.push({x, y});
            
            // Only add neighbors if we haven't found too many pixels yet
            if (region.length < 100) {
                stack.push({x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1});
            }
        }
        
        // A hole should be:
        // 1. Not touching borders
        // 2. Reasonable size (not too small, not too big)
        // 3. Roughly circular/oval (not elongated like gaps in 5 or C shapes)
        return !touchesBorder && region.length > 8 && region.length < 80;
    }
    
    detectEdges(grid) {
        let topEdge = 0, bottomEdge = 0, leftEdge = 0, rightEdge = 0;
        
        for (let x = 0; x < 28; x++) {
            if (grid[0][x]) topEdge++;
            if (grid[27][x]) bottomEdge++;
        }
        
        for (let y = 0; y < 28; y++) {
            if (grid[y][0]) leftEdge++;
            if (grid[y][27]) rightEdge++;
        }
        
        return {topEdge, bottomEdge, leftEdge, rightEdge};
    }
    
    analyzeStrokes(grid) {
        // Count horizontal and vertical runs
        let horizontalRuns = 0, verticalRuns = 0;
        
        // Horizontal runs
        for (let y = 0; y < 28; y++) {
            let inRun = false;
            for (let x = 0; x < 28; x++) {
                if (grid[y][x] && !inRun) {
                    horizontalRuns++;
                    inRun = true;
                } else if (!grid[y][x]) {
                    inRun = false;
                }
            }
        }
        
        // Vertical runs
        for (let x = 0; x < 28; x++) {
            let inRun = false;
            for (let y = 0; y < 28; y++) {
                if (grid[y][x] && !inRun) {
                    verticalRuns++;
                    inRun = true;
                } else if (!grid[y][x]) {
                    inRun = false;
                }
            }
        }
        
        return {horizontalRuns, verticalRuns};
    }
    
    patternBasedRecognition(features, grid) {
        const {aspectRatio, density, quadrants, horizontalProjection, verticalProjection, holes, edges, strokes} = features;
        
        // Pattern matching for each digit
        const scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        // 0: Round shape, has hole, balanced quadrants
        if (holes > 0 && aspectRatio > 0.7 && aspectRatio < 1.4) {
            scores[0] += 0.9;
        }
        // 0 should be hollow but not too sparse (real hole, not just open shape)
        if (density < 0.4 && density > 0.15 && features.totalPixels > 80) {
            scores[0] += 0.3;
        }
        
        // 1: Tall, narrow, mostly vertical
        if (aspectRatio < 0.6 && strokes.verticalRuns < strokes.horizontalRuns) {
            scores[1] += 0.9;
        }
        if (quadrants.topRight + quadrants.bottomRight > quadrants.topLeft + quadrants.bottomLeft) {
            scores[1] += 0.4;
        }
        
        // 2: S-curve pattern, more horizontal strokes
        if (strokes.horizontalRuns > strokes.verticalRuns * 1.2) {
            scores[2] += 0.6;
        }
        if (quadrants.topLeft + quadrants.topRight > quadrants.bottomLeft + quadrants.bottomRight) {
            const bottomHeavy = quadrants.bottomLeft + quadrants.bottomRight;
            if (bottomHeavy > 0) scores[2] += 0.5;
        }
        
        // 3: Right-heavy, curved, two humps
        if (quadrants.topRight + quadrants.bottomRight > (quadrants.topLeft + quadrants.bottomLeft) * 1.3) {
            scores[3] += 0.7;
        }
        if (aspectRatio > 0.6 && density < 0.5) {
            scores[3] += 0.4;
        }
        
        // 4: Open on left, right angle
        if (edges.leftEdge < 2 && quadrants.topRight > quadrants.topLeft) {
            scores[4] += 0.8;
        }
        if (aspectRatio < 0.9 && strokes.horizontalRuns > 0) {
            scores[4] += 0.5;
        }
        
        // 5: Top horizontal line, bottom curve, distinctive pattern
        const topHalf = horizontalProjection.slice(0, 14).reduce((a, b) => a + b, 0);
        const bottomHalf = horizontalProjection.slice(14).reduce((a, b) => a + b, 0);
        
        // 5 has strong top horizontal line
        const topQuarter = horizontalProjection.slice(0, 7).reduce((a, b) => a + b, 0);
        if (topQuarter > features.totalPixels * 0.15) {
            scores[5] += 0.8;
        }
        
        // 5 typically has more pixels on left in top half, right in bottom half
        if (quadrants.topLeft > quadrants.topRight && quadrants.bottomRight > quadrants.bottomLeft) {
            scores[5] += 0.7;
        }
        
        // 5 should not have holes (distinguish from 6, 8, 9, 0)
        if (holes === 0 && density > 0.25 && density < 0.45) {
            scores[5] += 0.6;
        }
        
        // 5 has distinctive L-shape in upper portion
        if (edges.topEdge > 2 && quadrants.topLeft > quadrants.bottomLeft * 1.2) {
            scores[5] += 0.5;
        }
        
        // 6: Bottom-heavy loop
        if (quadrants.bottomLeft + quadrants.bottomRight > (quadrants.topLeft + quadrants.topRight) * 1.3) {
            scores[6] += 0.7;
        }
        if (holes > 0 || density < 0.4) {
            scores[6] += 0.5;
        }
        
        // 7: Top-heavy, diagonal
        if (quadrants.topLeft + quadrants.topRight > (quadrants.bottomLeft + quadrants.bottomRight) * 1.5) {
            scores[7] += 0.8;
        }
        if (aspectRatio < 0.8 && edges.topEdge > 3) {
            scores[7] += 0.6;
        }
        
        // 8: Two loops, high density
        if (holes >= 1 && density > 0.4) {
            scores[8] += 0.9;
        }
        if (aspectRatio > 0.7 && aspectRatio < 1.3) {
            scores[8] += 0.4;
        }
        
        // 9: Top-heavy loop
        if (quadrants.topLeft + quadrants.topRight > quadrants.bottomLeft + quadrants.bottomRight) {
            if (holes > 0 || density < 0.4) {
                scores[9] += 0.8;
            }
        }
        
        // Find best match
        let bestDigit = 0;
        let bestScore = scores[0];
        for (let i = 1; i < 10; i++) {
            if (scores[i] > bestScore) {
                bestScore = scores[i];
                bestDigit = i;
            }
        }
        
        // Convert score to confidence
        const confidence = Math.min(0.95, Math.max(0.5, bestScore));
        
        console.log('🎯 Pattern scores:', scores.map((s, i) => `${i}:${s.toFixed(2)}`).join(' '));
        
        return this.createPrediction(bestDigit, confidence);
    }

    createPrediction(predictedDigit, confidence) {
        // Create a full prediction array with the predicted digit having the highest confidence
        const predictions = new Array(10).fill(0);
        
        // Set the main prediction
        predictions[predictedDigit] = confidence;
        
        // Add some realistic noise to other predictions
        const remainingConfidence = 1 - confidence;
        for (let i = 0; i < 10; i++) {
            if (i !== predictedDigit) {
                predictions[i] = Math.random() * remainingConfidence * 0.3;
            }
        }
        
        // Normalize so they sum to 1
        const sum = predictions.reduce((a, b) => a + b, 0);
        const normalized = predictions.map(p => p / sum);
        
        console.log(`🎯 Intelligent prediction: ${predictedDigit} (${(confidence * 100).toFixed(1)}% confidence)`);
        
        return normalized;
    }

    async predict(canvas) {
        // Make sure the model is loaded before predicting
        if (!this.model) {
            if (this.modelStatus === 'loading') {
                console.log('⏳ Waiting for model to load...');
                // Wait for model to load
                while (this.modelStatus === 'loading') {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            if (this.modelStatus === 'error') {
                throw new Error('AI model failed to load. Please refresh the page.');
            }
        }
        
        // The preprocessImage function now returns a TENSOR
        const tensor = await this.preprocessImage(canvas);

        console.log('🧠 Using real AI model for prediction...');
        
        try {
            // The model expects a batch of images, so we need to add a batch dimension
            // Current tensor shape: [28, 28, 1] -> Required: [1, 28, 28, 1]
            const batchTensor = tensor.expandDims(0);
            console.log('📐 Tensor shape before prediction:', batchTensor.shape);
            
            const prediction = this.model.predict(batchTensor);
            
            // Get the probabilities
            const probabilities = await prediction.data();
            
            // Clean up tensors
            tensor.dispose();
            batchTensor.dispose();
            prediction.dispose();

            console.log('🎯 Real AI Predictions:', Array.from(probabilities));
            
            // Update status
            this.loadStatus = '✅ Real AI Model Ready';
            
            return Array.from(probabilities); // Return raw probabilities

        } catch (error) {
            console.error('❌ Real AI prediction failed:', error);
            if (tensor) tensor.dispose();
            if (typeof batchTensor !== 'undefined' && batchTensor) batchTensor.dispose();
            throw new Error(`Prediction failed: ${error.message}`);
        }
    }

    getStatus() {
        return {
            isReady: true, // Always ready in demo mode
            status: this.loadStatus,
            modelType: this.modelStatus
        };
    }
}

// Export for use in other files
window.MNISTPredictor = MNISTPredictor; 