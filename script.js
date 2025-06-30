// Main script for CNN Explorer
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeMachineLearning();
    initializeCanvas();
    initializeAnimations();
    initializeMobileMenu();
    initializeInteractiveSteps();
    initializeScrollToTop();
    initialize3DCNNDemo(); // Initialize the 3D CNN animation
});

// Initialize the ML predictor
function initializeMachineLearning() {
    // Create global ML predictor instance
    if (typeof window.MNISTPredictor !== 'undefined') {
        window.mnistPredictor = new window.MNISTPredictor();
        console.log('🤖 ML Predictor initialized successfully');
        
        // Monitor model loading status
        monitorModelStatus();
    } else {
        console.error('❌ MNISTPredictor class not found');
        updateModelStatusUI('error', '❌ TensorFlow.js not loaded');
    }
}

// Monitor the model loading status and update UI
function monitorModelStatus() {
    const updateInterval = setInterval(() => {
        if (!window.mnistPredictor) {
            clearInterval(updateInterval);
            return;
        }
        
        const status = window.mnistPredictor.getStatus();
        
        if (window.mnistPredictor.modelStatus === 'loading') {
            updateModelStatusUI('loading', '⏳ Loading TensorFlow.js Model...');
        } else if (window.mnistPredictor.modelStatus === 'ready') {
            updateModelStatusUI('loaded', '✅ TensorFlow.js Model Ready');
            clearInterval(updateInterval); // Stop monitoring once loaded
        } else if (window.mnistPredictor.modelStatus === 'error') {
            updateModelStatusUI('error', '❌ Failed to Load Model');
            clearInterval(updateInterval);
        }
    }, 500); // Check every 500ms
}

// Update model status in UI
function updateModelStatusUI(statusType, message) {
    const modelStatus = document.getElementById('modelStatus');
    if (modelStatus) {
        modelStatus.className = `model-status ${statusType}`;
        modelStatus.textContent = message;
    }
}

// Navigation functionality
function initializeNavigation() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }
    });
}

// Canvas drawing functionality
function initializeCanvas() {
    const canvas = document.getElementById('drawingCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Initialize canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas properties
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';

    // Drawing event handlers
    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        if (e.type === 'mousedown') {
            lastX = (e.clientX - rect.left) * scaleX;
            lastY = (e.clientY - rect.top) * scaleY;
        } else if (e.type === 'touchstart') {
            e.preventDefault();
            const touch = e.touches[0];
            lastX = (touch.clientX - rect.left) * scaleX;
            lastY = (touch.clientY - rect.top) * scaleY;
        }
    }

    function draw(e) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let currentX, currentY;
        
        if (e.type === 'mousemove') {
            currentX = (e.clientX - rect.left) * scaleX;
            currentY = (e.clientY - rect.top) * scaleY;
        } else if (e.type === 'touchmove') {
            e.preventDefault();
            const touch = e.touches[0];
            currentX = (touch.clientX - rect.left) * scaleX;
            currentY = (touch.clientY - rect.top) * scaleY;
        }

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        lastX = currentX;
        lastY = currentY;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // Clear button
    const clearButton = document.getElementById('clearCanvas');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            // Clear and restore white background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            clearPredictionResults();
            clearDebugCanvases();
        });
    }

    // Predict button
    const predictButton = document.getElementById('predictDigit');
    if (predictButton) {
        predictButton.addEventListener('click', async function() {
            await performRealPrediction(canvas);
        });
    }
}

// Perform real CNN prediction using TensorFlow.js
async function performRealPrediction(canvas) {
    const resultsContainer = document.getElementById('predictionResults');
    if (!resultsContainer) return;

    // Check if ML predictor is initialized
    if (!window.mnistPredictor) {
        console.error('❌ ML Predictor not initialized');
        resultsContainer.innerHTML = `
            <div class="prediction-result">
                <h4>❌ ML System Error</h4>
                <p>Please refresh the page and try again</p>
            </div>
        `;
        return;
    }

    // Show loading state
    resultsContainer.innerHTML = `
        <div class="prediction-loading">
            <div class="loading-spinner"></div>
            <p>🧠 AI is analyzing your drawing...</p>
        </div>
    `;

    // Add loading spinner styles if not already added
    addPredictionStyles();

    try {
        // Use the global MNIST predictor
        const rawPredictions = await window.mnistPredictor.predict(canvas);
        
        // Convert raw predictions array to format expected by displayPredictions
        const formattedPredictions = rawPredictions
            .map((confidence, digit) => ({ digit, confidence }))
            .sort((a, b) => b.confidence - a.confidence) // Sort by confidence descending
            .slice(0, 5); // Top 5 predictions
        
        // Validate if prediction is within supported range (1-4)
        const topPrediction = formattedPredictions[0];
        const isValidRange = topPrediction.digit >= 1 && topPrediction.digit <= 4;
        const hasGoodConfidence = topPrediction.confidence > 0.4; // At least 40% confidence
        
        // Debug logging
        console.log('🔍 Prediction Debug:', {
            topPrediction,
            isValidRange,
            hasGoodConfidence,
            allPredictions: formattedPredictions
        });
        

        
        // Show results after a brief delay for better UX
        setTimeout(() => {
            if (isValidRange && hasGoodConfidence) {
                console.log('✅ Showing normal prediction');
                displayPredictions(formattedPredictions, true);
            } else {
                console.log('⚠️ Showing out-of-range message');
                showOutOfRangeMessage(topPrediction);
            }
        }, 500);
        
    } catch (error) {
        console.error('Prediction failed:', error);
        
        // Show error message
        setTimeout(() => {
            resultsContainer.innerHTML = `
                <div class="prediction-result">
                    <h4>⚠️ Processing Error</h4>
                    <p>Unable to analyze drawing. Please try drawing a clearer digit.</p>
                </div>
            `;
        }, 1000);
    }
}

// Add prediction styles if not already present
function addPredictionStyles() {
    if (!document.querySelector('#prediction-styles')) {
        const style = document.createElement('style');
        style.id = 'prediction-styles';
        style.textContent = `
            .prediction-loading {
                text-align: center;
                color: var(--text-secondary);
                padding: 2rem;
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-left: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .prediction-bar {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                border-radius: 0.5rem;
                background: var(--surface-color);
                transition: all 0.3s ease;
            }
            .prediction-bar:hover {
                transform: translateX(5px);
            }
            .prediction-bar.top {
                background: var(--gradient-primary);
                color: white;
                font-weight: 600;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .digit-label {
                font-size: 1.2rem;
                font-weight: 600;
                min-width: 30px;
                text-align: center;
            }
            .confidence-bar {
                flex: 1;
                height: 8px;
                background: var(--border-color);
                border-radius: 4px;
                overflow: hidden;
            }
            .confidence-fill {
                height: 100%;
                background: var(--gradient-accent);
                transition: width 0.8s ease;
            }
            .confidence-percent {
                font-size: 0.9rem;
                color: var(--text-secondary);
                font-weight: 500;
            }
            .prediction-result {
                text-align: center;
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: var(--surface-color);
                border-radius: 0.5rem;
                border: 2px solid var(--primary-color);
            }
            .prediction-result h4 {
                margin: 0 0 0.5rem 0;
                color: var(--primary-color);
                font-size: 1.5rem;
            }
            .prediction-result p {
                margin: 0;
                font-size: 1.1rem;
                color: var(--text-secondary);
            }
            .ai-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: var(--gradient-primary);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.8rem;
                font-weight: 600;
                margin-left: 0.5rem;
            }
            .model-status {
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                margin-bottom: 1rem;
                font-weight: 500;
                text-align: center;
            }
            .model-status.loading {
                background: #fef3c7;
                color: #92400e;
            }
            .model-status.loaded {
                background: #d1fae5;
                color: #065f46;
            }
            .model-status.fallback {
                background: #dbeafe;
                color: #1e40af;
            }
            .model-status.error {
                background: #fecaca;
                color: #991b1b;
            }
        `;
        document.head.appendChild(style);
    }
}

function displayPredictions(predictions, isRealAI = false) {
    const resultsContainer = document.getElementById('predictionResults');
    if (!resultsContainer) return;

    let html = '<div class="prediction-list">';
    
    predictions.forEach((pred, index) => {
        const isTop = index === 0;
        const percentage = Math.round(pred.confidence * 100);
        
        html += `
            <div class="prediction-bar ${isTop ? 'top' : ''}">
                <div class="digit-label">${pred.digit}</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="confidence-percent">${percentage}%</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    if (predictions.length > 0) {
        const topPrediction = predictions[0];
        const topPercentage = Math.round(topPrediction.confidence * 100);
        const aiBadge = isRealAI ? '<span class="ai-badge"><i class="fas fa-robot"></i> Real AI</span>' : '<span class="ai-badge"><i class="fas fa-flask"></i> Demo</span>';
        
        html = `
            <div class="prediction-result">
                <h4>🎯 Prediction: ${topPrediction.digit} ${aiBadge}</h4>
                <p>Confidence: ${topPercentage}%</p>
            </div>
        ` + html;
    }
    
    resultsContainer.innerHTML = html;
}

function showOutOfRangeMessage(prediction) {
    const resultsContainer = document.getElementById('predictionResults');
    if (!resultsContainer) return;
    
    const predictedDigit = prediction.digit;
    const confidence = Math.round(prediction.confidence * 100);
    
    let message = "";
    let encouragement = "";
    
    if (predictedDigit === 0) {
        message = "I see you drew a 0! 🙂";
        encouragement = "This specialized model focuses on digits 1-4 for the best accuracy.";
    } else if (predictedDigit >= 5) {
        message = `Nice ${predictedDigit}! 🎉`;
        encouragement = "This model was trained specifically on digits 1-4. Try drawing one of those!";
    } else {
        // Low confidence case
        message = "Hmm, I'm not quite sure what that is... 🤔";
        encouragement = "Try drawing a clearer digit from 1-4. Make it big and bold!";
    }
    
    resultsContainer.innerHTML = `
        <div class="out-of-range-message">
            <h4>${message}</h4>
            <p>${encouragement}</p>
        </div>
        <div class="prediction-result">
            <h4>🤖 Model Limitation</h4>
            <p>This AI model specializes in recognizing digits <strong>1, 2, 3, and 4</strong> with high accuracy.</p>
        </div>
    `;
}

function clearPredictionResults() {
    const resultsContainer = document.getElementById('predictionResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="prediction-placeholder">
                <i class="fas fa-arrow-left"></i>
                <p>Draw a digit (1-4) and click "Predict" to see the magic!</p>
            </div>
        `;
    }
}

function clearDebugCanvases() {
    // Clear the debug original canvas
    const debugOriginal = document.getElementById('debugOriginal');
    if (debugOriginal) {
        const ctx = debugOriginal.getContext('2d');
        ctx.clearRect(0, 0, debugOriginal.width, debugOriginal.height);
    }
    
    // Clear the debug processed canvas (AI input)
    const debugProcessed = document.getElementById('debugProcessed');
    if (debugProcessed) {
        const ctx = debugProcessed.getContext('2d');
        ctx.clearRect(0, 0, debugProcessed.width, debugProcessed.height);
    }
}

// Animation and scroll effects
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards and sections
    const animatedElements = document.querySelectorAll('.overview-card, .feature-item, .layer-step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add mobile menu styles
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('#mobile-menu-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-menu-styles';
        style.textContent = `
            @media (max-width: 768px) {
                .nav-menu {
                    position: fixed;
                    left: -100%;
                    top: 70px;
                    flex-direction: column;
                    background: var(--surface-color);
                    width: 100%;
                    text-align: center;
                    transition: 0.3s;
                    box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
                    border-top: 1px solid var(--border-color);
                    z-index: 999;
                }

                .nav-menu.active {
                    left: 0;
                }

                .nav-menu li {
                    margin: 1rem 0;
                }

                .hamburger.active .bar:nth-child(2) {
                    opacity: 0;
                }

                .hamburger.active .bar:nth-child(1) {
                    transform: translateY(7px) rotate(45deg);
                }

                .hamburger.active .bar:nth-child(3) {
                    transform: translateY(-7px) rotate(-45deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Add smooth reveal animations
window.addEventListener('load', function() {
    // Animate floating cards in hero section
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Console welcome message
console.log(`
🧠 Welcome to ArtificialGate CNN Explorer!
🎨 Draw a digit and watch our neural network analyze it
📚 Learn how CNNs work step by step
🚀 Built with modern web technologies

Happy learning! 🎉
`);

// Learning Progress Management
function initializeInteractiveSteps() {
    initializeScrollProgress();
    initializePixelGrid();
    initializeConvolution();
    initialize3DCNNDemo(); // Add 3D CNN animation demo
}

function initializeScrollProgress() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const learningSteps = document.querySelectorAll('.learning-step');
    const progressLines = document.querySelectorAll('.progress-line');
    
    // Intersection Observer for scroll-based progress
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-20% 0px -20% 0px'
    };
    
    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepId = entry.target.id;
                const stepNumber = stepId.split('-')[1];
                updateProgress(parseInt(stepNumber));
            }
        });
    }, observerOptions);
    
    // Observe all learning steps
    learningSteps.forEach(step => {
        stepObserver.observe(step);
    });
    
    function updateProgress(currentStep) {
        progressSteps.forEach((step, index) => {
            const stepIndex = index + 1;
            if (stepIndex < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepIndex === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        // Update progress lines
        progressLines.forEach((line, index) => {
            if (index < currentStep - 1) {
                line.classList.add('completed');
            } else {
                line.classList.remove('completed');
            }
        });
    }
    
    // Add smooth scrolling to progress step clicks
    progressSteps.forEach((step, index) => {
        step.addEventListener('click', () => {
            const targetStep = document.getElementById(`step-${index + 1}`);
            if (targetStep) {
                targetStep.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Step 1: Pixel Grid Animation
function initializePixelGrid() {
    const pixelGrid = document.getElementById('pixelGrid');
    const numberMatrix = document.getElementById('numberMatrix');
    const playBtn = document.getElementById('playStep1');
    const pauseBtn = document.getElementById('pauseStep1');
    const resetBtn = document.getElementById('resetStep1');
    
    if (!pixelGrid || !numberMatrix || !playBtn) return; // Safety check
    const currentPixelSpan = document.getElementById('currentPixel');
    const currentPositionSpan = document.getElementById('currentPosition');
    const progressCounterSpan = document.getElementById('progressCounter');
    
    let animationInterval = null;
    let currentPixelIndex = 0;
    const totalPixels = 20 * 20; // 20x20 for consistency with Step 3
    
    // Create a 20x20 version of the digit "7" pattern - exactly like Step 3
    function createDigit7Pattern20x20() {
        // Extract center 20x20 from the original 28x28 pattern
        const original28x28 = [
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,
            0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        
        // Extract center 20x20 region (skip 4 pixels on each side)
        const pattern20x20 = [];
        for (let row = 4; row < 24; row++) {
            for (let col = 4; col < 24; col++) {
                const index = row * 28 + col;
                pattern20x20.push(original28x28[index]);
            }
        }
        
        return pattern20x20;
    }
    
    // Sample digit "7" pattern (20x20) - consistent with other steps
    const digitPattern = createDigit7Pattern20x20();
    
    // Create pixel grid and number matrix using EXACT SAME styling as Step 3's "Before Pooling"
    function createPixelGrid() {
        // Left side: Visual representation (What Humans See) - NO NUMBERS, just visual
        pixelGrid.innerHTML = '';
        for (let i = 0; i < totalPixels; i++) {
            const cell = document.createElement('div');
            cell.className = 'pixel'; // Will be styled like pooling-cell
            const value = digitPattern[i];
            
            // Visual representation: Show like real handwriting (black ink on white paper)
            if (value === 255) {
                cell.style.background = '#000000'; // Pure black for digit strokes
                cell.style.color = '#ffffff';
            } else if (value === 0) {
                cell.style.background = '#ffffff'; // Pure white for background
                cell.style.color = '#000000';
            } else {
                // Any intermediate values as inverted grayscale (higher value = darker)
                const grayValue = Math.round(255 - (value / 255) * 255);
                cell.style.background = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
                cell.style.color = grayValue > 127 ? '#ffffff' : '#000000';
            }
            
            // NO TEXT for human view - just visual representation like a real image
            // cell.textContent = ''; // Leave empty for pure visual
            
            // Enhanced hover interaction
            cell.addEventListener('mouseenter', function() {
                const row = Math.floor(i / 20);
                const col = i % 20;
                currentPixelSpan.textContent = digitPattern[i];
                currentPositionSpan.textContent = `Row ${row}, Col ${col}`;
                
                // Hover highlight like Step 3
                cell.style.transform = 'scale(1.1)';
                cell.style.boxShadow = '0 0 10px rgba(37, 99, 235, 0.6)';
                cell.style.zIndex = '5';
            });
            
            cell.addEventListener('mouseleave', function() {
                cell.style.transform = 'scale(1)';
                cell.style.boxShadow = 'none';
                cell.style.zIndex = '1';
            });
            
            pixelGrid.appendChild(cell);
        }
        
        // Right side: Numerical matrix (What Computer Sees) - Shows "?" initially, numbers during animation
        numberMatrix.innerHTML = '';
        for (let i = 0; i < totalPixels; i++) {
            const cell = document.createElement('div');
            cell.className = 'number-cell'; // Will be styled like pooling-cell
            
            // Start with neutral gray background and "?" text
            cell.style.background = '#6b7280'; // Gray background initially
            cell.style.color = '#ffffff';
            
            // Show "?" initially - will be replaced with numbers during animation
            cell.textContent = '?';
            cell.style.fontSize = '8px';
            cell.style.fontWeight = '600';
            
            numberMatrix.appendChild(cell);
        }
        
        // Reset progress counter
        if (progressCounterSpan) {
            progressCounterSpan.textContent = '0/400';
        }
    }
    
    function startAnimation() {
        if (animationInterval) return;
        
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
        
        // Much faster animation like Steps 2 and 3
        animationInterval = setInterval(() => {
            if (currentPixelIndex >= totalPixels) {
                stopAnimation();
                return;
            }
            
            const pixel = pixelGrid.children[currentPixelIndex];
            const numberCell = numberMatrix.children[currentPixelIndex];
            const pixelValue = digitPattern[currentPixelIndex];
            const row = Math.floor(currentPixelIndex / 20);
            const col = currentPixelIndex % 20;
            
            // EXACT SAME animation style as Step 3's pooling highlight  
            pixel.style.border = '3px solid #2563eb';
            pixel.style.borderRadius = '4px';
            pixel.style.boxShadow = '0 0 15px rgba(37, 99, 235, 0.9), 0 0 25px rgba(37, 99, 235, 0.7)';
            pixel.style.transform = 'scale(1.15)';
            pixel.style.zIndex = '10';
            
            // Update number cell with actual value and proper colors during animation
            
            // Set the proper colors and value
            if (pixelValue === 255) {
                numberCell.style.background = '#ffffff'; // Pure white for digit strokes
                numberCell.style.color = '#000000';
            } else if (pixelValue === 0) {
                numberCell.style.background = '#000000'; // Pure black for background
                numberCell.style.color = '#ffffff';
            } else {
                // Any intermediate values as grayscale
                const grayValue = Math.round((pixelValue / 255) * 255);
                numberCell.style.background = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
                numberCell.style.color = grayValue > 127 ? '#000000' : '#ffffff';
            }
            
            // Show the actual number
            numberCell.textContent = pixelValue;
            
            // Same animation highlight for number cell
            numberCell.style.border = '3px solid #ffffff';
            numberCell.style.borderRadius = '4px';
            numberCell.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.9), 0 0 25px rgba(37, 99, 235, 0.7)';
            numberCell.style.transform = 'scale(1.15)';
            numberCell.style.zIndex = '10';
            
            // Update info displays
            currentPixelSpan.textContent = pixelValue;
            currentPositionSpan.textContent = `Row ${row}, Col ${col}`;
            progressCounterSpan.textContent = `${currentPixelIndex + 1}/400`;
            
            // Remove highlight after short duration (matching Step 3 timing)
            setTimeout(() => {
                pixel.style.border = '';
                pixel.style.borderRadius = '';
                pixel.style.boxShadow = '';
                pixel.style.transform = 'scale(1)';
                pixel.style.zIndex = '1';
                
                numberCell.style.border = '';
                numberCell.style.borderRadius = '';
                numberCell.style.boxShadow = '';
                numberCell.style.transform = 'scale(1)';
                numberCell.style.zIndex = '1';
            }, 150); // Consistent with Step 3 timing
            
            currentPixelIndex++;
        }, 100); // Much faster - consistent with Step 2 and 3
    }
    
    function pauseAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
    }
    
    function stopAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
    }
    
    function resetAnimation() {
        stopAnimation();
        currentPixelIndex = 0;
        createPixelGrid();
        currentPixelSpan.textContent = '0-255';
        currentPositionSpan.textContent = 'Row 0, Col 0';
        progressCounterSpan.textContent = '0/400';
    }
    
    // Event listeners
    playBtn.addEventListener('click', startAnimation);
    pauseBtn.addEventListener('click', pauseAnimation);
    resetBtn.addEventListener('click', resetAnimation);
    
    // Initialize
    createPixelGrid();
}

// Step 2: Convolution Animation
function initializeConvolution() {
    const originalMatrix = document.getElementById('originalMatrix');
    const filterMatrix = document.getElementById('filterMatrix');
    const resultMatrix = document.getElementById('resultMatrix');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const playBtn = document.getElementById('playStep2');
    const pauseBtn = document.getElementById('pauseStep2');
    const resetBtn = document.getElementById('resetStep2');
    
    if (!originalMatrix || !filterMatrix || !resultMatrix || !playBtn) return; // Safety check
    
    let animationInterval = null;
    let currentFilter = 'edge';
    
    const filters = {
        edge: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
        vertical: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
        horizontal: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]]
    };
    
    // Use the same digit "7" pattern from Step 1, cropped to show the relevant area
    const digitPattern = [
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,
        0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
    ];
    
    // Use the full 28x28 digit "7" - same as Step 1 for consistency
    const sampleImage = [];
    for (let i = 0; i < 28; i++) {
        sampleImage[i] = [];
        for (let j = 0; j < 28; j++) {
            const index = i * 28 + j;
            sampleImage[i][j] = digitPattern[index];
        }
    }
    
    function createMatrices() {
        // Original image matrix (28x28) - same as Step 1
        originalMatrix.innerHTML = '';
        for (let i = 0; i < 28; i++) {
            for (let j = 0; j < 28; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                const value = sampleImage[i][j];
                // Invert colors to show white digit on dark background like in Step 1
                const displayValue = 255 - value;
                cell.style.background = `rgb(${displayValue}, ${displayValue}, ${displayValue})`;
                cell.style.color = value > 127 ? 'white' : 'black';
                cell.textContent = value;
                originalMatrix.appendChild(cell);
            }
        }
        
        // Filter matrix
        updateFilterMatrix();
        
        // Result matrix (26x26 after convolution) - show larger 20x20 section for better understanding
        resultMatrix.innerHTML = '';
        // Show 20x20 section of the result for better clarity
        for (let i = 0; i < 400; i++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.textContent = '0';
            cell.style.background = '#1e293b';
            cell.style.color = 'white';
            resultMatrix.appendChild(cell);
        }
    }
    
    function updateFilterMatrix() {
        filterMatrix.innerHTML = '';
        const filter = filters[currentFilter];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.textContent = filter[i][j];
                // Better color coding for filter values
                if (filter[i][j] > 0) {
                    cell.style.background = '#10b981'; // Green for positive
                    cell.style.color = 'white';
                } else if (filter[i][j] < 0) {
                    cell.style.background = '#ef4444'; // Red for negative
                    cell.style.color = 'white';
                } else {
                    cell.style.background = '#6b7280'; // Gray for zero
                    cell.style.color = 'white';
                }
                filterMatrix.appendChild(cell);
            }
        }
    }
    
    function performConvolution() {
        let step = 0;
        const filter = filters[currentFilter];
        
        // Focus on interesting region of the "7" but show more of it (20x20 result)
        const focusStartRow = 4; // Start a bit higher to show more of the digit
        const focusStartCol = 4; // Start a bit more to the left
        
        animationInterval = setInterval(() => {
            if (step >= 400) { // 20x20 result matrix
                stopAnimation();
                return;
            }
            
            const i = Math.floor(step / 20);
            const j = step % 20;
            
            // Actual position in the 28x28 image
            const actualRow = focusStartRow + i;
            const actualCol = focusStartCol + j;
            
            // Highlight current 3x3 region in original image
            originalMatrix.querySelectorAll('.matrix-cell').forEach(cell => {
                cell.classList.remove('active');
            });
            
            // Calculate convolution for current position
            let sum = 0;
            for (let di = 0; di < 3; di++) {
                for (let dj = 0; dj < 3; dj++) {
                    const imageRow = actualRow + di;
                    const imageCol = actualCol + dj;
                    if (imageRow < 28 && imageCol < 28 && imageRow >= 0 && imageCol >= 0) {
                        const imageIndex = imageRow * 28 + imageCol;
                        originalMatrix.children[imageIndex].classList.add('active');
                        sum += sampleImage[imageRow][imageCol] * filter[di][dj];
                    }
                }
            }
            
            // Update result matrix with better visualization
            const normalizedSum = sum / 2040; // Better normalization for 3x3 * 255 max
            let resultValue;
            
            // Better handling of different filter types
            if (currentFilter === 'edge') {
                resultValue = Math.max(0, Math.min(255, Math.abs(normalizedSum) * 255));
            } else {
                // For directional filters, show both positive and negative responses
                resultValue = Math.max(0, Math.min(255, (normalizedSum + 1) * 127.5));
            }
            
            const resultCell = resultMatrix.children[step];
            resultCell.textContent = Math.round(resultValue);
            
            // Enhanced color coding based on filter type and result
            if (currentFilter === 'edge') {
                if (resultValue > 200) {
                    resultCell.style.background = '#22c55e'; // Bright green for strong edges
                    resultCell.style.color = 'white';
                } else if (resultValue > 100) {
                    resultCell.style.background = '#eab308'; // Yellow for moderate edges
                    resultCell.style.color = 'black';
                } else if (resultValue > 50) {
                    resultCell.style.background = '#f97316'; // Orange for weak edges
                    resultCell.style.color = 'white';
                } else {
                    resultCell.style.background = '#1e293b'; // Dark for no edges
                    resultCell.style.color = 'white';
                }
            } else {
                // For directional filters, use blue-red spectrum
                if (normalizedSum > 0.3) {
                    resultCell.style.background = '#3b82f6'; // Blue for positive response
                    resultCell.style.color = 'white';
                } else if (normalizedSum < -0.3) {
                    resultCell.style.background = '#ef4444'; // Red for negative response
                    resultCell.style.color = 'white';
                } else {
                    resultCell.style.background = '#6b7280'; // Gray for neutral
                    resultCell.style.color = 'white';
                }
            }
            
            resultCell.classList.add('active');
            
            setTimeout(() => {
                resultCell.classList.remove('active');
            }, 150); // Even shorter highlight duration for faster animation
            
            step++;
        }, 100); // Much faster animation - 100ms instead of 200ms
    }
    
    function startAnimation() {
        if (animationInterval) return;
        
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
        performConvolution();
    }
    
    function pauseAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
    }
    
    function stopAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
    }
    
    function resetAnimation() {
        stopAnimation();
        createMatrices();
    }
    
    // Filter selection with improved feedback
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            updateFilterMatrix();
            // Reset the result matrix when changing filters
            resetAnimation();
        });
    });
    
    // Event listeners
    playBtn?.addEventListener('click', startAnimation);
    pauseBtn?.addEventListener('click', pauseAnimation);
    resetBtn?.addEventListener('click', resetAnimation);
    
    // Initialize
    createMatrices();
}

// Step 3: Pooling Animation
function initializePooling() {
    const beforePooling = document.getElementById('beforePooling');
    const afterPooling = document.getElementById('afterPooling');
    const poolingWindow = document.getElementById('poolingWindow');
    const playBtn = document.getElementById('playStep3');
    const pauseBtn = document.getElementById('pauseStep3');
    const resetBtn = document.getElementById('resetStep3');
    
    if (!beforePooling || !afterPooling || !playBtn) return; // Safety check
    
    let animationInterval = null;
    
    // Use the same digit "7" pattern from Step 2's result matrix for consistency
    // This represents a 20x20 feature map after convolution
    function generateFeatureMapFromDigit7() {
        // Create a 20x20 feature map based on the digit "7" pattern
        // Simulate what the convolution step would have produced
        const featureMap = [];
        
        // Pattern for digit "7" in feature map space (20x20)
        const digit7Pattern = [
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        
        // Convert pattern to feature values with some variation
        for (let i = 0; i < 400; i++) {
            const baseValue = digit7Pattern[i];
            if (baseValue === 1) {
                // Strong feature activation (edges detected)
                featureMap[i] = Math.floor(Math.random() * 100) + 150; // 150-250
            } else {
                // Weak or no activation
                featureMap[i] = Math.floor(Math.random() * 80) + 10; // 10-90
            }
        }
        
        return featureMap;
    }
    
    // Sample feature map (20x20) - using consistent digit "7" pattern
    const featureMap = generateFeatureMapFromDigit7();
    
    function createPoolingMatrices() {
        // Before pooling matrix (20x20) - consistent with Step 2 output
        beforePooling.innerHTML = '';
        for (let i = 0; i < 400; i++) {
            const cell = document.createElement('div');
            cell.className = 'pooling-cell';
            const value = featureMap[i];
            
            // Better color representation based on activation strength
            if (value > 200) {
                cell.style.background = '#22c55e'; // Green for strong activation
                cell.style.color = 'white';
            } else if (value > 150) {
                cell.style.background = '#eab308'; // Yellow for moderate activation
                cell.style.color = 'black';
            } else if (value > 100) {
                cell.style.background = '#f97316'; // Orange for weak activation
                cell.style.color = 'white';
            } else {
                cell.style.background = '#1e293b'; // Dark for minimal activation
                cell.style.color = 'white';
            }
            
            // Add text value for better understanding
            cell.textContent = value;
            cell.style.fontSize = '8px';
            cell.style.fontWeight = '600';
            
            beforePooling.appendChild(cell);
        }
        
        // After pooling matrix (10x10) - half the dimensions due to 2x2 pooling
        afterPooling.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'pooling-cell';
            cell.style.background = '#000';
            cell.style.color = 'white';
            cell.textContent = '0';
            cell.style.fontSize = '10px';
            cell.style.fontWeight = '600';
            afterPooling.appendChild(cell);
        }
    }
    
    function performPooling() {
        let step = 0;
        
        animationInterval = setInterval(() => {
            if (step >= 100) { // 10x10 result matrix
                stopAnimation();
                return;
            }
            
            const row = Math.floor(step / 10);
            const col = step % 10;
            
            // Clear previous highlights and reset styles
            beforePooling.querySelectorAll('.pooling-cell').forEach(cell => {
                cell.classList.remove('highlight');
                cell.style.border = '';
                cell.style.borderRadius = '';
                cell.style.boxShadow = '';
            });
            
            // Highlight 2x2 window in the 20x20 input with enhanced visibility
            const windowCells = [];
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const cellRow = row * 2 + i;
                    const cellCol = col * 2 + j;
                    const cellIndex = cellRow * 20 + cellCol; // 20x20 grid
                    if (cellIndex < 400) { // Safety check
                        const cell = beforePooling.children[cellIndex];
                        cell.classList.add('highlight');
                        
                        // Add additional visual cues for the pooling window
                        cell.style.border = '3px solid #ffffff';
                        cell.style.borderRadius = '4px';
                        cell.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.9), 0 0 25px rgba(6, 182, 212, 0.7)';
                        
                        windowCells.push(featureMap[cellIndex]);
                    }
                }
            }
            
            // Find maximum value (Max Pooling)
            const maxValue = Math.max(...windowCells);
            poolingWindow.textContent = maxValue;
            poolingWindow.style.fontSize = '14px';
            poolingWindow.style.fontWeight = '700';
            
            // Update result with enhanced color coding
            const resultCell = afterPooling.children[step];
            resultCell.textContent = maxValue;
            
            // Apply same color scheme as input for consistency
            if (maxValue > 200) {
                resultCell.style.background = '#22c55e'; // Green for strong activation
                resultCell.style.color = 'white';
            } else if (maxValue > 150) {
                resultCell.style.background = '#eab308'; // Yellow for moderate activation
                resultCell.style.color = 'black';
            } else if (maxValue > 100) {
                resultCell.style.background = '#f97316'; // Orange for weak activation
                resultCell.style.color = 'white';
            } else {
                resultCell.style.background = '#1e293b'; // Dark for minimal activation
                resultCell.style.color = 'white';
            }
            
            // Add temporary highlight
            resultCell.classList.add('highlight');
            setTimeout(() => {
                resultCell.classList.remove('highlight');
            }, 150); // Consistent with Step 2 timing
            
            step++;
        }, 100); // Much faster animation - consistent with Step 2
    }
    
    function startAnimation() {
        if (animationInterval) return;
        
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
        performPooling();
    }
    
    function pauseAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
    }
    
    function stopAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
    }
    
    function resetAnimation() {
        stopAnimation();
        createPoolingMatrices();
        poolingWindow.textContent = 'Max';
        poolingWindow.style.fontSize = '12px';
        poolingWindow.style.fontWeight = '600';
    }
    
    // Event listeners
    playBtn?.addEventListener('click', startAnimation);
    pauseBtn?.addEventListener('click', pauseAnimation);
    resetBtn?.addEventListener('click', resetAnimation);
    
    // Initialize
    createPoolingMatrices();
}

// Step 4: Classification Animation
function initializeClassification() {
    const featureVector = document.getElementById('featureVector');
    const networkLayers = document.getElementById('networkLayers');
    const predictionBars = document.getElementById('predictionBars');
    const playBtn = document.getElementById('playStep4');
    const pauseBtn = document.getElementById('pauseStep4');
    const resetBtn = document.getElementById('resetStep4');
    
    if (!featureVector || !networkLayers || !predictionBars || !playBtn) return; // Safety check
    
    let animationInterval = null;
    
    function createFlattendFeatureVisualization() {
        // Clear previous content
        featureVector.innerHTML = '';
        
        // Create visual representation of flattening process
        const flatteningContainer = document.createElement('div');
        flatteningContainer.className = 'flattening-container';
        
        // Step 1: Show 2D pooled feature map (10x10 from Step 3)
        const pooledGrid = document.createElement('div');
        pooledGrid.className = 'pooled-feature-map';
        pooledGrid.innerHTML = '<h5>10×10 Pooled Features</h5>';
        
        const grid2D = document.createElement('div');
        grid2D.className = 'feature-grid-2d';
        
        // Create 10x10 grid with sample values
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'feature-cell-2d';
            const value = Math.floor(Math.random() * 200) + 50; // Sample feature values
            cell.style.backgroundColor = `hsl(220, 70%, ${Math.max(20, Math.min(80, value/3))}%)`;
            cell.textContent = value;
            grid2D.appendChild(cell);
        }
        
        pooledGrid.appendChild(grid2D);
        
        // Step 2: Arrow showing flattening
        const flatteningArrow = document.createElement('div');
        flatteningArrow.className = 'flattening-arrow';
        flatteningArrow.innerHTML = `
            <i class="fas fa-arrow-down"></i>
            <span>Flatten to 1D</span>
        `;
        
        // Step 3: Show 1D feature vector
        const vectorContainer = document.createElement('div');
        vectorContainer.className = 'feature-vector-1d';
        vectorContainer.innerHTML = '<h5>100 Features (1D Vector)</h5>';
        
        const vector1D = document.createElement('div');
        vector1D.className = 'feature-vector-display';
        
        // Create horizontal representation of flattened features
        for (let i = 0; i < 100; i++) {
            const segment = document.createElement('div');
            segment.className = 'vector-segment';
            const value = Math.floor(Math.random() * 200) + 50;
            segment.style.backgroundColor = `hsl(220, 70%, ${Math.max(20, Math.min(80, value/3))}%)`;
            segment.style.height = `${Math.max(5, value/10)}px`;
            vector1D.appendChild(segment);
        }
        
        vectorContainer.appendChild(vector1D);
        
        // Assemble the visualization
        flatteningContainer.appendChild(pooledGrid);
        flatteningContainer.appendChild(flatteningArrow);
        flatteningContainer.appendChild(vectorContainer);
        featureVector.appendChild(flatteningContainer);
    }

    function createNetworkVisualization() {
        networkLayers.innerHTML = '';
        
        // Create layers with different neuron counts
        const layerSizes = [16, 10, 10];
        
        layerSizes.forEach((size, layerIndex) => {
            const layer = document.createElement('div');
            layer.className = 'network-layer';
            
            for (let i = 0; i < size; i++) {
                const neuron = document.createElement('div');
                neuron.className = 'neuron';
                layer.appendChild(neuron);
            }
            
            networkLayers.appendChild(layer);
        });
        
        // Create prediction bars
        predictionBars.innerHTML = '';
        const predictions = [0.05, 0.02, 0.01, 0.08, 0.03, 0.15, 0.04, 0.87, 0.12, 0.06]; // Digit 7 has highest confidence
        
        for (let i = 0; i < 10; i++) {
            const bar = document.createElement('div');
            bar.className = 'prediction-bar';
            
            bar.innerHTML = `
                <span class="digit-label">${i}</span>
                <div class="confidence-bar">
                    <div class="confidence-fill" data-confidence="${predictions[i]}"></div>
                </div>
                <span class="confidence-value">${(predictions[i] * 100).toFixed(1)}%</span>
            `;
            
            predictionBars.appendChild(bar);
        }
    }
    
    function animateClassification() {
        let step = 0;
        
        animationInterval = setInterval(() => {
            if (step === 0) {
                // Animate flattening process
                const grid2D = featureVector.querySelector('.feature-grid-2d');
                const vector1D = featureVector.querySelector('.feature-vector-display');
                const arrow = featureVector.querySelector('.flattening-arrow');
                
                if (grid2D) {
                    // Highlight 2D grid cells one by one
                    const cells = grid2D.querySelectorAll('.feature-cell-2d');
                    cells.forEach((cell, index) => {
                        setTimeout(() => {
                            cell.style.transform = 'scale(1.1)';
                            cell.style.boxShadow = '0 0 10px rgba(37, 99, 235, 0.7)';
                            
                            // Highlight corresponding vector segment
                            const vectorSegment = vector1D?.children[index];
                            if (vectorSegment) {
                                vectorSegment.style.transform = 'scaleY(1.5)';
                                vectorSegment.style.boxShadow = '0 0 5px rgba(37, 99, 235, 0.7)';
                            }
                        }, index * 50); // Fast animation
                    });
                    
                    // Animate arrow
                    if (arrow) {
                        setTimeout(() => {
                            arrow.style.transform = 'scale(1.1)';
                            arrow.style.color = 'var(--primary-color)';
                        }, 2500);
                    }
                }
            } else if (step <= 3) {
                // Activate neurons layer by layer
                const layers = networkLayers.children;
                const layerIndex = step - 1;
                if (layers[layerIndex]) {
                    const neurons = layers[layerIndex].querySelectorAll('.neuron');
                    neurons.forEach((neuron, index) => {
                        setTimeout(() => {
                            neuron.classList.add('active');
                        }, index * 100);
                    });
                }
            } else if (step === 4) {
                // Animate prediction bars
                const confidenceFills = predictionBars.querySelectorAll('.confidence-fill');
                confidenceFills.forEach((fill, index) => {
                    const confidence = parseFloat(fill.getAttribute('data-confidence'));
                    setTimeout(() => {
                        fill.style.width = `${confidence * 100}%`;
                    }, index * 100);
                });
                
                // Highlight the prediction with highest confidence
                setTimeout(() => {
                    const bars = predictionBars.querySelectorAll('.prediction-bar');
                    bars[7].style.background = 'var(--gradient-primary)';
                    bars[7].style.color = 'white';
                    bars[7].style.borderRadius = 'var(--border-radius)';
                    bars[7].style.padding = 'var(--spacing-xs)';
                }, 1000);
                
                stopAnimation();
            }
            
            step++;
        }, 1000);
    }
    
    function startAnimation() {
        if (animationInterval) return;
        
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
        animateClassification();
    }
    
    function pauseAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
    }
    
    function stopAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
    }
    
    function resetAnimation() {
        stopAnimation();
        createFlattendFeatureVisualization();
        createNetworkVisualization();
        
        // Reset flattening visualization
        const cells = featureVector.querySelectorAll('.feature-cell-2d');
        cells.forEach(cell => {
            cell.style.transform = '';
            cell.style.boxShadow = '';
        });
        
        const segments = featureVector.querySelectorAll('.vector-segment');
        segments.forEach(segment => {
            segment.style.transform = '';
            segment.style.boxShadow = '';
        });
        
        const arrow = featureVector.querySelector('.flattening-arrow');
        if (arrow) {
            arrow.style.transform = '';
            arrow.style.color = '';
        }
        
        // Reset neural network
        const neurons = networkLayers.querySelectorAll('.neuron');
        neurons.forEach(neuron => neuron.classList.remove('active'));
        
        const confidenceFills = predictionBars.querySelectorAll('.confidence-fill');
        confidenceFills.forEach(fill => fill.style.width = '0%');
        
        const bars = predictionBars.querySelectorAll('.prediction-bar');
        bars.forEach(bar => {
            bar.style.background = '';
            bar.style.color = '';
            bar.style.borderRadius = '';
            bar.style.padding = '';
        });
    }
    
    // Event listeners
    playBtn?.addEventListener('click', startAnimation);
    pauseBtn?.addEventListener('click', pauseAnimation);
    resetBtn?.addEventListener('click', resetAnimation);
    
    // Initialize
    createFlattendFeatureVisualization();
    createNetworkVisualization();
}

// Scroll to Top Button
function initializeScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });
    
    // Smooth scroll to top when clicked
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 3D CNN Animation Demo - Standalone Animated Visualization
function initialize3DCNNDemo() {
    const playButton = document.getElementById('play3DDemo');
    const pauseButton = document.getElementById('pause3DDemo');
    const restartButton = document.getElementById('restart3DDemo');
    const viewport = document.getElementById('cnn3DViewport');
    const currentStage = document.getElementById('currentStage');
    
    if (!viewport) return;
    
    let animationRunning = false;
    let animationTimeout = null;
    let currentStageIndex = 0;
    
    const stages = [
        {
            name: 'input',
            title: '🖼️ Input Processing',
            description: 'A handwritten "7" enters as a 28×28 pixel matrix. Watch each pixel light up as it gets processed!'
        },
        {
            name: 'conv1', 
            title: '🔍 First Convolution',
            description: '32 edge detection filters scan the image simultaneously. Each filter finds different features like lines and curves.'
        },
        {
            name: 'pool1',
            title: '📉 Max Pooling',
            description: 'Downsampling reduces the image size by 50% while keeping the most important features. This makes processing faster!'
        },
        {
            name: 'conv2',
            title: '🧠 Second Convolution', 
            description: '64 deeper filters combine basic features into complex patterns. The network is learning to recognize digit shapes!'
        },
        {
            name: 'output',
            title: '🎯 Final Classification',
            description: '10 output neurons compete! The "7" neuron wins with 94.2% confidence - that\'s how the AI knows what you drew!'
        }
    ];
    
    // Initialize the 3D scene
    function initializeScene() {
        viewport.innerHTML = `
            <div class="cnn-3d-scene">
                <div class="cnn-layer input-layer">
                    <div class="layer-grid input-grid" id="inputGrid"></div>
                    <div class="layer-label">Input (28×28)</div>
                </div>
                <div class="cnn-layer conv-layer-1">
                    <div class="layer-grid conv-grid" id="conv1Grid"></div>
                    <div class="layer-label">Conv Layer 1</div>
                </div>
                <div class="cnn-layer pool-layer-1">
                    <div class="layer-grid pool-grid" id="pool1Grid"></div>
                    <div class="layer-label">Pool Layer 1</div>
                </div>
                <div class="cnn-layer conv-layer-2">
                    <div class="layer-grid conv-grid" id="conv2Grid"></div>
                    <div class="layer-label">Conv Layer 2</div>
                </div>
                <div class="cnn-layer output-layer">
                    <div class="layer-grid output-grid" id="outputGrid"></div>
                    <div class="layer-label">Output (10 classes)</div>
                </div>
            </div>
        `;
        
        // Create neural nodes for each layer
        createLayerNodes('inputGrid', 64, 'digit7'); // 8x8 sample
        createLayerNodes('conv1Grid', 36, 'edges'); // 6x6 
        createLayerNodes('pool1Grid', 16, 'pooled'); // 4x4
        createLayerNodes('conv2Grid', 36, 'features'); // 6x6
        createLayerNodes('outputGrid', 10, 'output'); // 2x5 (representing 10 classes)
    }
    
    function createLayerNodes(gridId, count, type) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        for (let i = 0; i < count; i++) {
            const node = document.createElement('div');
            node.className = 'neural-node';
            node.dataset.type = type;
            node.dataset.index = i;
            grid.appendChild(node);
        }
    }
    
    function updateStageUI(stageIndex) {
        // Update stage progress
        const stageElements = document.querySelectorAll('.stage');
        stageElements.forEach((stage, index) => {
            stage.classList.remove('active', 'completed');
            if (index < stageIndex) {
                stage.classList.add('completed');
            } else if (index === stageIndex) {
                stage.classList.add('active');
            }
        });
        
        // Update current stage info with detailed descriptions
        const stage = stages[stageIndex];
        if (currentStage && stage) {
            currentStage.innerHTML = `
                <h4>${stage.title}</h4>
                <p>${stage.description}</p>
            `;
        }
    }
    
    function animateStage(stageIndex) {
        if (stageIndex >= stages.length) {
            // Animation complete - show impressive results
            setTimeout(() => {
                if (currentStage) {
                    currentStage.innerHTML = `
                        <h4>🎉 Neural Network Classification Complete!</h4>
                        <p>✨ The CNN processed 784 input pixels through 93,322 parameters in milliseconds to correctly identify "7" with 94.2% confidence!</p>
                        <div style="margin-top: 1rem; padding: 1rem; background: linear-gradient(135deg, #10b981, #06b6d4); border-radius: 0.5rem; color: white;">
                            <strong>🚀 Amazing Performance:</strong> From raw pixels to prediction in just 5 layers!
                        </div>
                    `;
                }
                setTimeout(() => {
                    if (animationRunning) {
                        currentStageIndex = 0;
                        animateStage(0); // Loop the animation automatically
                    }
                }, 4000); // Give more time to read the results
            }, 1000);
            return;
        }
        
        const stage = stages[stageIndex];
        updateStageUI(stageIndex);
        
        // Animate current layer
        switch(stage.name) {
            case 'input':
                animateInputLayer();
                break;
            case 'conv1':
                animateConvolutionLayer('conv1Grid', 'inputGrid');
                break;
            case 'pool1':
                animatePoolingLayer('pool1Grid', 'conv1Grid');
                break;
            case 'conv2':
                animateConvolutionLayer('conv2Grid', 'pool1Grid');
                break;
            case 'output':
                animateOutputLayer();
                break;
        }
        
        // Schedule next stage
        if (animationRunning) {
            animationTimeout = setTimeout(() => {
                currentStageIndex++;
                animateStage(currentStageIndex);
            }, 4000); // Increased timing for better visibility
        }
    }
    
    function animateInputLayer() {
        const nodes = document.querySelectorAll('#inputGrid .neural-node');
        
        // Create digit "7" pattern
        const digit7Pattern = [
            1,1,1,1,1,1,0,0,
            0,0,0,0,0,1,0,0,
            0,0,0,0,1,0,0,0,
            0,0,0,1,0,0,0,0,
            0,0,1,0,0,0,0,0,
            0,1,0,0,0,0,0,0,
            1,0,0,0,0,0,0,0,
            1,0,0,0,0,0,0,0
        ];
        
        nodes.forEach((node, index) => {
            setTimeout(() => {
                node.classList.add('active');
                if (digit7Pattern[index]) {
                    node.classList.add('high-activation');
                }
                
                // Add data particles more frequently
                if (index % 6 === 0) addDataParticle('inputGrid', 'conv1Grid');
            }, index * 50);
        });
    }
    
    function animateConvolutionLayer(targetId, sourceId) {
        const nodes = document.querySelectorAll(`#${targetId} .neural-node`);
        
        nodes.forEach((node, index) => {
            setTimeout(() => {
                node.classList.add('active');
                
                // Random activation pattern - higher for edge-like features
                const activation = Math.random();
                if (activation > 0.7) {
                    node.classList.add('high-activation');
                } else if (activation > 0.4) {
                    node.classList.add('medium-activation');
                }
                
                // Add data particles more frequently
                if (index % 4 === 0) addDataParticle(sourceId, targetId);
            }, index * 80);
        });
    }
    
    function animatePoolingLayer(targetId, sourceId) {
        const nodes = document.querySelectorAll(`#${targetId} .neural-node`);
        
        nodes.forEach((node, index) => {
            setTimeout(() => {
                node.classList.add('active');
                
                // Pooling keeps strong activations
                if (Math.random() > 0.5) {
                    node.classList.add('medium-activation');
                }
                
                // Add data particles more frequently
                if (index % 3 === 0) addDataParticle(sourceId, targetId);
            }, index * 100);
        });
    }
    
    function animateOutputLayer() {
        const nodes = document.querySelectorAll('#outputGrid .neural-node');
        
        // Simulate confidence scores for digits 0-9
        const confidences = [0.02, 0.01, 0.03, 0.01, 0.05, 0.03, 0.01, 0.94, 0.01, 0.02]; // "7" has highest
        
        nodes.forEach((node, index) => {
            setTimeout(() => {
                node.classList.add('active');
                
                const confidence = confidences[index] || 0.01;
                if (confidence > 0.8) {
                    node.classList.add('high-activation'); // This is "7"
                } else if (confidence > 0.1) {
                    node.classList.add('medium-activation');
                }
                
                // Add final data particle
                if (index === 7) addDataParticle('conv2Grid', 'outputGrid'); // Highlight path to "7"
            }, index * 150);
        });
    }
    
    function addDataParticle(fromId, toId) {
        const fromElement = document.getElementById(fromId);
        const toElement = document.getElementById(toId);
        const scene = document.querySelector('.cnn-3d-scene');
        
        if (!fromElement || !toElement || !scene) return;
        
        const particle = document.createElement('div');
        particle.className = 'data-particle';
        
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();
        
        particle.style.left = `${fromRect.left - sceneRect.left + fromRect.width/2}px`;
        particle.style.top = `${fromRect.top - sceneRect.top + fromRect.height/2}px`;
        
        scene.appendChild(particle);
        
        // Animate particle movement
        requestAnimationFrame(() => {
            particle.style.transition = 'all 1s ease';
            particle.style.left = `${toRect.left - sceneRect.left + toRect.width/2}px`;
            particle.style.top = `${toRect.top - sceneRect.top + toRect.height/2}px`;
            particle.style.opacity = '0';
        });
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, 1000);
    }
    
    function resetAnimation() {
        // Clear all active states
        const nodes = document.querySelectorAll('.neural-node');
        nodes.forEach(node => {
            node.classList.remove('active', 'high-activation', 'medium-activation');
        });
        
        // Clear data particles
        const particles = document.querySelectorAll('.data-particle');
        particles.forEach(particle => particle.remove());
        
        currentStageIndex = 0;
        updateStageUI(0);
        
        if (currentStage) {
            currentStage.innerHTML = `
                <h4>🚀 Ready to Start</h4>
                <p>Click "Start CNN Animation" to see how a real neural network processes a handwritten "7" through 5 layers of computation! Each stage will show detailed explanations as the animation progresses.</p>
            `;
        }
    }
    
    // Event listeners
    playButton?.addEventListener('click', () => {
        if (!animationRunning) {
            animationRunning = true;
            playButton.style.display = 'none';
            pauseButton.style.display = 'inline-flex';
            
            // Continue from current stage instead of restarting
            setTimeout(() => animateStage(currentStageIndex), 200);
        }
    });
    
    pauseButton?.addEventListener('click', () => {
        animationRunning = false;
        playButton.style.display = 'inline-flex';
        pauseButton.style.display = 'none';
        
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
    });
    
    restartButton?.addEventListener('click', () => {
        animationRunning = false;
        playButton.style.display = 'inline-flex';
        pauseButton.style.display = 'none';
        
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
        
        resetAnimation();
    });
    
    // Make stage buttons clickable
    function makeStagesClickable() {
        const stageButtons = document.querySelectorAll('.stage');
        stageButtons.forEach((button, index) => {
            button.style.cursor = 'pointer';
            button.addEventListener('click', () => {
                // Only pause and jump if clicking on a different stage than current
                if (index !== currentStageIndex) {
                    if (animationRunning) {
                        // Pause current animation
                        animationRunning = false;
                        if (animationTimeout) {
                            clearTimeout(animationTimeout);
                            animationTimeout = null;
                        }
                        playButton.style.display = 'inline-flex';
                        pauseButton.style.display = 'none';
                    }
                    
                    // Jump to selected stage
                    currentStageIndex = index;
                    resetAnimation();
                    updateStageUI(index);
                    
                    // Show stage info immediately
                    const stage = stages[index];
                    if (currentStage && stage) {
                        currentStage.innerHTML = `
                            <h4>${stage.title}</h4>
                            <p>${stage.description}</p>
                            <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                                <em>Click "Start CNN Animation" to see this stage in action!</em>
                            </div>
                        `;
                    }
                }
                // If clicking on current stage during animation, just let it continue
            });
        });
    }

    // Initialize the scene on load
    initializeScene();
    resetAnimation();
    makeStagesClickable();
}

// ===== Complete CNN Visualization Functionality =====
function initializeCompleteCNNVisualization() {
    console.log('🚀 Initializing Complete CNN Visualization');
    
    initializeHyperparameterControls();
    initializeCNNPipeline();
    updateHyperparameterEffects();
}

// Hyperparameter Controls
function initializeHyperparameterControls() {
    const controls = {
        filterSize: document.getElementById('filterSize'),
        numFilters: document.getElementById('numFilters'),
        activationThreshold: document.getElementById('activationThreshold'),
        poolingSize: document.getElementById('poolingSize')
    };

    // Update value displays and effects
    Object.entries(controls).forEach(([param, slider]) => {
        if (slider) {
            const valueSpan = document.getElementById(param + 'Value');
            
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                if (valueSpan) {
                    if (param === 'filterSize' || param === 'poolingSize') {
                        valueSpan.textContent = `${value}×${value}`;
                    } else {
                        valueSpan.textContent = value;
                    }
                }
                
                // Update visual elements based on parameter changes
                updateVisualParameters(param, parseInt(value) || parseFloat(value));
                
                // Update hyperparameter effects
                updateHyperparameterEffects();
            });
        }
    });
}

// Update visual parameters in real-time
function updateVisualParameters(param, value) {
    switch(param) {
        case 'filterSize':
            updateFilterSize(value);
            break;
        case 'numFilters':
            updateFilterCounts(value);
            break;
        case 'activationThreshold':
            updateActivationThreshold(value);
            break;
        case 'poolingSize':
            updatePoolingSize(value);
            break;
    }
}

// Update filter size visualization
function updateFilterSize(size) {
    const filterKernel = document.getElementById('filterKernel');
    const inputPatch = document.getElementById('inputPatch');
    const conv1FilterSize = document.getElementById('conv1FilterSize');
    
    if (conv1FilterSize) conv1FilterSize.textContent = `${size}×${size}`;
    
    // Recreate filter kernel with new size
    if (filterKernel) {
        createFilterKernel(filterKernel, size);
    }
    if (inputPatch) {
        createInputPatch(inputPatch, size);
    }
}

// Update pooling size visualization
function updatePoolingSize(size) {
    const poolingWindow = document.getElementById('poolingWindow');
    const poolingFormula = document.querySelector('.pooling-formula');
    
    if (poolingWindow) poolingWindow.textContent = `${size}×${size}`;
    if (poolingFormula) poolingFormula.textContent = `max(${size}×${size})`;
    
    // Recreate pooling visualization
    createPoolingVisualization(size);
}

// Update filter counts in the pipeline visualization
function updateFilterCounts(filterCount) {
    const conv1Filters = document.getElementById('conv1Filters');
    const conv2Filters = document.getElementById('conv2Filters');
    
    if (conv1Filters) conv1Filters.textContent = filterCount;
    if (conv2Filters) conv2Filters.textContent = filterCount * 2; // Second layer typically has more
}

// Update hyperparameter effect descriptions
function updateHyperparameterEffects() {
    const controls = {
        filterSize: parseInt(document.getElementById('filterSize')?.value || 3),
        numFilters: parseInt(document.getElementById('numFilters')?.value || 32),
        activationThreshold: parseFloat(document.getElementById('activationThreshold')?.value || 0.5),
        poolingSize: parseInt(document.getElementById('poolingSize')?.value || 2)
    };

    // Filter Size Effect
    const filterSizeEffect = document.getElementById('filterSizeEffect');
    if (filterSizeEffect) {
        if (controls.filterSize === 3) {
            filterSizeEffect.textContent = 'Fine Details';
            filterSizeEffect.style.color = '#22c55e';
        } else if (controls.filterSize === 5) {
            filterSizeEffect.textContent = 'Medium Features';
            filterSizeEffect.style.color = '#3b82f6';
        } else {
            filterSizeEffect.textContent = 'Large Patterns';
            filterSizeEffect.style.color = '#f97316';
        }
    }

    // Filters Effect
    const filtersEffect = document.getElementById('filtersEffect');
    if (filtersEffect) {
        if (controls.numFilters < 16) {
            filtersEffect.textContent = 'Simple';
            filtersEffect.style.color = '#f97316';
        } else if (controls.numFilters > 48) {
            filtersEffect.textContent = 'Complex';
            filtersEffect.style.color = '#3b82f6';
        } else {
            filtersEffect.textContent = 'Moderate';
            filtersEffect.style.color = '#22c55e';
        }
    }

    // Activation Threshold Effect
    const activationEffect = document.getElementById('activationEffect');
    if (activationEffect) {
        if (controls.activationThreshold < 0.3) {
            activationEffect.textContent = 'Very Sensitive';
            activationEffect.style.color = '#f97316';
        } else if (controls.activationThreshold > 0.7) {
            activationEffect.textContent = 'Very Selective';
            activationEffect.style.color = '#ef4444';
        } else {
            activationEffect.textContent = 'Balanced';
            activationEffect.style.color = '#22c55e';
        }
    }

    // Pooling Size Effect
    const poolingEffect = document.getElementById('poolingEffect');
    if (poolingEffect) {
        if (controls.poolingSize === 2) {
            poolingEffect.textContent = 'Preserves Detail';
            poolingEffect.style.color = '#22c55e';
        } else if (controls.poolingSize === 3) {
            poolingEffect.textContent = 'Moderate Compression';
            poolingEffect.style.color = '#3b82f6';
        } else {
            poolingEffect.textContent = 'High Compression';
            poolingEffect.style.color = '#f97316';
        }
    }
}

// CNN Pipeline Functionality
function initializeCNNPipeline() {
    initializePipelineControls();
    createInputCanvas();
    createFeatureMaps();
    createPredictionBars();
    initializeTechnicalVisualizations();
}

// Initialize all technical visualizations
function initializeTechnicalVisualizations() {
    // Create filter kernel
    const filterKernel = document.getElementById('filterKernel');
    if (filterKernel) {
        createFilterKernel(filterKernel, 3);
    }
    
    // Create input patch
    const inputPatch = document.getElementById('inputPatch');
    if (inputPatch) {
        createInputPatch(inputPatch, 3);
    }
    
    // Create pooling visualization
    createPoolingVisualization(2);
    
    // Create Conv2 technical visualizations
    createConv2FilterKernel();
    createConv2InputPatch();
}

// Pipeline Control Buttons
function initializePipelineControls() {
    const startBtn = document.getElementById('startCNNPipeline');
    const pauseBtn = document.getElementById('pauseCNNPipeline');
    const resetBtn = document.getElementById('resetCNNPipeline');
    const speedBtn = document.getElementById('speedToggle');

    let isRunning = false;
    let isPaused = false;
    let speed = 1;
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!isRunning || isPaused) {
                startCNNPipelineAnimation();
                isRunning = true;
                isPaused = false;
                
                startBtn.style.display = 'none';
                if (pauseBtn) pauseBtn.style.display = 'inline-flex';
            }
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            pauseCNNPipelineAnimation();
            isPaused = true;
            
            pauseBtn.style.display = 'none';
            if (startBtn) startBtn.style.display = 'inline-flex';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetCNNPipelineAnimation();
            isRunning = false;
            isPaused = false;
            
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (startBtn) startBtn.style.display = 'inline-flex';
        });
    }

    if (speedBtn) {
        speedBtn.addEventListener('click', () => {
            speed = speed === 1 ? 2 : speed === 2 ? 0.5 : 1;
            speedBtn.innerHTML = `<i class="fas fa-tachometer-alt"></i> Speed: ${speed}x`;
            updateAnimationSpeed(speed);
        });
    }
}

// Create input canvas with a sample digit
function createInputCanvas() {
    const canvas = document.getElementById('inputCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas to higher resolution
    const scale = 2;
    canvas.width = 120 * scale;
    canvas.height = 120 * scale;
    canvas.style.width = '120px';
    canvas.style.height = '120px';
    ctx.scale(scale, scale);
    
    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 120, 120);
    
    // Draw a sample "7" digit
    drawSampleDigit7(ctx);
    
    // Create pixel matrix visualization
    createPixelMatrix();
}

// Create pixel matrix showing actual values
function createPixelMatrix() {
    const container = document.getElementById('inputMatrix');
    if (!container) return;
    
    // Sample 8x8 representation of digit "7"
    const digit7Matrix = [
        [255, 255, 255, 255, 255, 255, 200, 100],
        [0, 0, 0, 0, 0, 255, 180, 80],
        [0, 0, 0, 0, 200, 160, 60, 0],
        [0, 0, 0, 150, 120, 40, 0, 0],
        [0, 0, 100, 80, 20, 0, 0, 0],
        [0, 60, 40, 10, 0, 0, 0, 0],
        [30, 20, 5, 0, 0, 0, 0, 0],
        [15, 8, 0, 0, 0, 0, 0, 0]
    ];
    
    container.innerHTML = '';
    
    digit7Matrix.forEach((row, i) => {
        row.forEach((value, j) => {
            const pixelDiv = document.createElement('div');
            pixelDiv.className = 'pixel-value';
            pixelDiv.textContent = value;
            pixelDiv.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
            pixelDiv.style.color = value > 127 ? '#000' : '#fff';
            pixelDiv.setAttribute('data-value', value);
            pixelDiv.setAttribute('data-row', i);
            pixelDiv.setAttribute('data-col', j);
            container.appendChild(pixelDiv);
        });
    });
}

// Create filter kernel visualization
function createFilterKernel(container, size = 3) {
    if (!container) return;
    
    // Edge detection filter examples
    const filters = {
        3: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], // 3x3 edge detection
        5: [
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, 24, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1]
        ], // 5x5 edge detection
        7: [
            [-1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, 48, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1]
        ] // 7x7 edge detection
    };
    
    const filter = filters[size] || filters[3];
    
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    filter.forEach(row => {
        row.forEach(value => {
            const kernelDiv = document.createElement('div');
            kernelDiv.className = 'kernel-value';
            kernelDiv.textContent = value;
            kernelDiv.style.backgroundColor = value > 0 ? '#22c55e' : '#ef4444';
            kernelDiv.style.color = 'white';
            container.appendChild(kernelDiv);
        });
    });
}

// Create input patch visualization
function createInputPatch(container, size = 3) {
    if (!container) return;
    
    // Sample input patch from digit "7"
    const patches = {
        3: [[255, 255, 255], [0, 0, 255], [0, 200, 160]], // 3x3 patch
        5: [
            [255, 255, 255, 255, 200],
            [0, 0, 0, 255, 180],
            [0, 0, 200, 160, 60],
            [0, 150, 120, 40, 0],
            [100, 80, 20, 0, 0]
        ], // 5x5 patch
        7: [
            [255, 255, 255, 255, 255, 200, 100],
            [0, 0, 0, 0, 255, 180, 80],
            [0, 0, 0, 200, 160, 60, 0],
            [0, 0, 150, 120, 40, 0, 0],
            [0, 100, 80, 20, 0, 0, 0],
            [60, 40, 10, 0, 0, 0, 0],
            [20, 5, 0, 0, 0, 0, 0]
        ] // 7x7 patch
    };
    
    const patch = patches[size] || patches[3];
    
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    patch.forEach(row => {
        row.forEach(value => {
            const patchDiv = document.createElement('div');
            patchDiv.className = 'patch-value';
            patchDiv.textContent = value;
            patchDiv.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
            patchDiv.style.color = value > 127 ? '#000' : '#fff';
            container.appendChild(patchDiv);
        });
    });
}

// Create pooling visualization
function createPoolingVisualization(poolSize = 2) {
    const poolInput = document.getElementById('poolInput');
    const poolOutput = document.getElementById('poolOutput');
    
    if (!poolInput || !poolOutput) return;
    
    // Sample feature map values for pooling
    const inputValues = poolSize === 2 ? 
        [[0.8, 0.3], [0.1, 0.9]] : // 2x2
        poolSize === 3 ?
        [[0.8, 0.3, 0.2], [0.1, 0.9, 0.4], [0.6, 0.2, 0.7]] : // 3x3
        [[0.8, 0.3, 0.2, 0.1], [0.1, 0.9, 0.4, 0.3], [0.6, 0.2, 0.7, 0.5], [0.4, 0.1, 0.3, 0.8]]; // 4x4
    
    // Calculate max value for output
    const maxValue = Math.max(...inputValues.flat());
    
    // Create input visualization
    poolInput.innerHTML = '';
    poolInput.style.gridTemplateColumns = `repeat(${poolSize}, 1fr)`;
    
    inputValues.forEach(row => {
        row.forEach(value => {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'pool-value';
            inputDiv.textContent = value.toFixed(1);
            
            if (value === maxValue) {
                inputDiv.classList.add('max');
            }
            
            const intensity = Math.floor(value * 255);
            inputDiv.style.backgroundColor = `rgb(${intensity}, ${intensity}, ${intensity})`;
            inputDiv.style.color = value > 0.5 ? '#000' : '#fff';
            poolInput.appendChild(inputDiv);
        });
    });
    
    // Create output visualization
    poolOutput.innerHTML = '';
    const outputDiv = document.createElement('div');
    outputDiv.className = 'pool-value max';
    outputDiv.textContent = maxValue.toFixed(1);
    outputDiv.style.backgroundColor = '#06b6d4';
    outputDiv.style.color = 'white';
    poolOutput.appendChild(outputDiv);
}

// Update activation threshold visualization
function updateActivationThreshold(threshold) {
    // Update feature maps based on threshold
    const featureMaps = document.querySelectorAll('.feature-map');
    featureMaps.forEach((map, index) => {
        const activation = Math.random(); // Simulate activation value
        map.classList.toggle('active', activation > threshold);
    });
}

// Draw a sample digit 7
function drawSampleDigit7(ctx) {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    // Top horizontal line (centered in 120x120 canvas)
    ctx.moveTo(35, 35);
    ctx.lineTo(85, 35);
    // Diagonal line
    ctx.lineTo(50, 85);
    ctx.stroke();
}

// Create feature maps visualization
function createFeatureMaps() {
    createFeatureMapGrid('conv1FeatureMaps', 16);
    createFeatureMapGrid('conv2FeatureMaps', 18); // 6x3 grid for Conv2
}

function createFeatureMapGrid(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const featureMap = document.createElement('div');
        featureMap.className = 'feature-map';
        featureMap.setAttribute('data-index', i);
        container.appendChild(featureMap);
    }
}

// Create prediction bars
function createPredictionBars() {
    const container = document.getElementById('predictionsViz');
    if (!container) return;

    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    container.innerHTML = '';

    digits.forEach(digit => {
        const predictionBar = document.createElement('div');
        predictionBar.className = 'prediction-bar';
        predictionBar.innerHTML = `
            <div class="prediction-label">${digit}</div>
            <div class="prediction-value">
                <div class="prediction-fill" data-digit="${digit}"></div>
            </div>
        `;
        container.appendChild(predictionBar);
    });
}

// Animation variables
let pipelineAnimationState = {
    isRunning: false,
    currentStage: 0,
    speed: 1,
    timeoutIds: []
};

// Start CNN Pipeline Animation
function startCNNPipelineAnimation() {
    pipelineAnimationState.isRunning = true;
    pipelineAnimationState.currentStage = 0;
    
    console.log('🎬 Starting CNN Pipeline Animation');
    
    // Reset all stages
    resetPipelineStages();
    
    // Start the animation sequence
    animatePipelineStage(0);
}

// Animate specific pipeline stage
function animatePipelineStage(stageIndex) {
    if (!pipelineAnimationState.isRunning) return;
    
    const stages = ['input', 'conv1', 'pool1', 'conv2', 'dense', 'output'];
    const stageName = stages[stageIndex];
    
    console.log(`🎯 Animating stage ${stageIndex}: ${stageName}`);
    
    // Update stage progress indicator
    updateStageProgressIndicator(stageIndex);
    
    // Activate current pipeline stage
    activatePipelineStage(stageIndex);
    
    // Stage-specific animations
    switch (stageIndex) {
        case 0: // Input
            animateInputStage();
            break;
        case 1: // Conv1
            animateConv1Stage();
            break;
        case 2: // Pool1
            animatePool1Stage();
            break;
        case 3: // Conv2
            animateConv2Stage();
            break;
        case 4: // Dense
            animateDenseStage();
            break;
        case 5: // Output
            animateOutputStage();
            break;
    }
    
    // Update training metrics
    updateTrainingMetrics(stageIndex);
    
    // Schedule next stage
    const delay = 2000 / pipelineAnimationState.speed;
    const timeoutId = setTimeout(() => {
        if (stageIndex < stages.length - 1) {
            animatePipelineStage(stageIndex + 1);
        } else {
            // Animation complete, restart after delay
            const restartTimeout = setTimeout(() => {
                if (pipelineAnimationState.isRunning) {
                    startCNNPipelineAnimation();
                }
            }, 3000 / pipelineAnimationState.speed);
            pipelineAnimationState.timeoutIds.push(restartTimeout);
        }
    }, delay);
    
    pipelineAnimationState.timeoutIds.push(timeoutId);
}

// Update stage progress indicator
function updateStageProgressIndicator(activeIndex) {
    const stages = document.querySelectorAll('.stage-progress-indicator .stage');
    stages.forEach((stage, index) => {
        stage.classList.toggle('active', index === activeIndex);
    });
}

// Activate pipeline stage
function activatePipelineStage(stageIndex) {
    const stages = document.querySelectorAll('.pipeline-stage');
    stages.forEach((stage, index) => {
        stage.classList.toggle('active', index === stageIndex);
    });
    
    // Animate data flow
    if (stageIndex > 0) {
        const flowElement = document.getElementById(`flow${stageIndex}`);
        if (flowElement) {
            flowElement.classList.add('active');
        }
    }
}

// Stage-specific animations
function animateInputStage() {
    const inputCanvas = document.getElementById('inputCanvas');
    if (inputCanvas) {
        inputCanvas.style.transform = 'scale(1.05)';
        setTimeout(() => {
            inputCanvas.style.transform = 'scale(1)';
        }, 500);
    }
    
    // Animate pixel matrix processing
    const pixelValues = document.querySelectorAll('.pixel-value');
    pixelValues.forEach((pixel, index) => {
        setTimeout(() => {
            pixel.classList.add('processing');
            setTimeout(() => {
                pixel.classList.remove('processing');
                pixel.classList.add('active');
            }, 300);
        }, index * 50);
    });
    
    // Update min/max values
    const inputMinMax = document.getElementById('inputMinMax');
    if (inputMinMax) {
        setTimeout(() => {
            inputMinMax.textContent = '0/255';
        }, 1000);
    }
}

function animateConv1Stage() {
    // Animate convolution operation
    const filterKernel = document.getElementById('filterKernel');
    const inputPatch = document.getElementById('inputPatch');
    
    if (filterKernel) {
        filterKernel.classList.add('active');
        setTimeout(() => {
            filterKernel.classList.remove('active');
        }, 1000);
    }
    
    if (inputPatch) {
        setTimeout(() => {
            inputPatch.classList.add('active');
            setTimeout(() => {
                inputPatch.classList.remove('active');
            }, 1000);
        }, 500);
    }
    
    // Animate feature maps
    const featureMaps = document.querySelectorAll('#conv1FeatureMaps .feature-map');
    const threshold = parseFloat(document.getElementById('activationThreshold')?.value || 0.5);
    
    featureMaps.forEach((map, index) => {
        setTimeout(() => {
            const activation = Math.random();
            if (activation > threshold) {
                map.classList.add('active');
            }
        }, index * 50);
    });
}

function animatePool1Stage() {
    // Animate pooling operation
    const poolInputValues = document.querySelectorAll('#poolInput .pool-value');
    const poolOutputValue = document.querySelector('#poolOutput .pool-value');
    
    // Animate input values being processed
    poolInputValues.forEach((value, index) => {
        setTimeout(() => {
            value.classList.add('processing');
            setTimeout(() => {
                value.classList.remove('processing');
            }, 500);
        }, index * 200);
    });
    
    // Animate output result
    if (poolOutputValue) {
        setTimeout(() => {
            poolOutputValue.style.transform = 'scale(1.2)';
            poolOutputValue.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.6)';
            setTimeout(() => {
                poolOutputValue.style.transform = 'scale(1)';
                poolOutputValue.style.boxShadow = '';
            }, 500);
        }, 800);
    }
}

function animateConv2Stage() {
    // Animate convolution operation with complex features
    const conv2FilterKernel = document.getElementById('conv2FilterKernel');
    const conv2InputPatch = document.getElementById('conv2InputPatch');
    
    if (conv2FilterKernel) {
        conv2FilterKernel.classList.add('active');
        setTimeout(() => {
            conv2FilterKernel.classList.remove('active');
        }, 1000);
    }
    
    if (conv2InputPatch) {
        setTimeout(() => {
            conv2InputPatch.classList.add('active');
            setTimeout(() => {
                conv2InputPatch.classList.remove('active');
            }, 1000);
        }, 500);
    }
    
    // Animate feature maps with complex patterns
    const featureMaps = document.querySelectorAll('#conv2FeatureMaps .feature-map');
    const threshold = parseFloat(document.getElementById('activationThreshold')?.value || 0.5);
    
    featureMaps.forEach((map, index) => {
        setTimeout(() => {
            const activation = Math.random();
            if (activation > threshold) {
                map.classList.add('complex'); // Use complex style instead of active
            }
            // Add feature map number
            map.textContent = index + 1;
        }, index * 40);
    });
}

function animateDenseStage() {
    const denseViz = document.getElementById('denseViz');
    if (denseViz) {
        denseViz.innerHTML = '<div style="color: var(--primary-color); font-weight: 600;">128 neurons</div>';
        denseViz.style.background = 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))';
        setTimeout(() => {
            denseViz.style.background = 'var(--gradient-surface)';
        }, 1000);
    }
}

function animateOutputStage() {
    // Animate prediction bars with sample probabilities
    const samplePredictions = [0.05, 0.15, 0.08, 0.12, 0.03, 0.02, 0.01, 0.52, 0.01, 0.01]; // Favoring digit 7
    
    samplePredictions.forEach((probability, digit) => {
        const fill = document.querySelector(`[data-digit="${digit}"]`);
        if (fill) {
            setTimeout(() => {
                fill.style.width = `${probability * 100}%`;
            }, digit * 100);
        }
    });
    
    // Update confidence value
    const confidenceValue = document.getElementById('confidenceValue');
    if (confidenceValue) {
        setTimeout(() => {
            confidenceValue.textContent = '52%';
        }, 1000);
    }
}

// Update training metrics
function updateTrainingMetrics(stageIndex) {
    const epoch = Math.floor(Math.random() * 10) + 1;
    const accuracy = Math.min(50 + stageIndex * 8 + Math.random() * 10, 98);
    const loss = Math.max(2.5 - stageIndex * 0.4 - Math.random() * 0.3, 0.1);
    
    const currentEpoch = document.getElementById('currentEpoch');
    const currentAccuracy = document.getElementById('currentAccuracy');
    const currentLoss = document.getElementById('currentLoss');
    const trainingSpeed = document.getElementById('trainingSpeed');
    const progressFill = document.getElementById('trainingProgressFill');
    
    if (currentEpoch) currentEpoch.textContent = epoch;
    if (currentAccuracy) currentAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    if (currentLoss) currentLoss.textContent = loss.toFixed(3);
    if (trainingSpeed) trainingSpeed.textContent = `${pipelineAnimationState.speed}x`;
    
    if (progressFill) {
        const progress = ((stageIndex + 1) / 6) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

// Reset pipeline stages
function resetPipelineStages() {
    // Clear active states
    document.querySelectorAll('.pipeline-stage').forEach(stage => {
        stage.classList.remove('active');
    });
    
    document.querySelectorAll('.stage').forEach(stage => {
        stage.classList.remove('active');
    });
    
    document.querySelectorAll('.data-flow').forEach(flow => {
        flow.classList.remove('active');
    });
    
    // Reset feature maps
    document.querySelectorAll('.feature-map').forEach(map => {
        map.classList.remove('active');
    });
    
    // Reset prediction bars
    document.querySelectorAll('.prediction-fill').forEach(fill => {
        fill.style.width = '0%';
    });
    
    // Reset metrics
    const currentEpoch = document.getElementById('currentEpoch');
    const currentAccuracy = document.getElementById('currentAccuracy');
    const currentLoss = document.getElementById('currentLoss');
    const confidenceValue = document.getElementById('confidenceValue');
    const progressFill = document.getElementById('trainingProgressFill');
    
    if (currentEpoch) currentEpoch.textContent = '0';
    if (currentAccuracy) currentAccuracy.textContent = '0%';
    if (currentLoss) currentLoss.textContent = '--';
    if (confidenceValue) confidenceValue.textContent = '--';
    if (progressFill) progressFill.style.width = '0%';
    
    // Activate first stage
    const firstStage = document.querySelector('.stage[data-stage="input"]');
    if (firstStage) firstStage.classList.add('active');
}

// Pause animation
function pauseCNNPipelineAnimation() {
    pipelineAnimationState.isRunning = false;
    
    // Clear all timeouts
    pipelineAnimationState.timeoutIds.forEach(id => clearTimeout(id));
    pipelineAnimationState.timeoutIds = [];
    
    console.log('⏸️ CNN Pipeline Animation Paused');
}

// Reset animation
function resetCNNPipelineAnimation() {
    pauseCNNPipelineAnimation();
    resetPipelineStages();
    
    console.log('🔄 CNN Pipeline Animation Reset');
}

// Update animation speed
function updateAnimationSpeed(newSpeed) {
    pipelineAnimationState.speed = newSpeed;
    console.log(`⚡ Animation speed updated to ${newSpeed}x`);
}

// Create Conv2 technical visualizations
function createConv2FilterKernel() {
    const conv2FilterKernel = document.getElementById('conv2FilterKernel');
    if (!conv2FilterKernel) return;
    
    conv2FilterKernel.innerHTML = '';
    
    // Complex feature detection filter (e.g., vertical edge detector with emphasis)
    const complexFilter = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    
    complexFilter.forEach(row => {
        row.forEach(value => {
            const cell = document.createElement('div');
            cell.className = 'kernel-value';
            cell.textContent = value;
            // Color coding for filter values
            if (value > 0) {
                cell.style.backgroundColor = '#e8f5e8';
                cell.style.color = '#2d5a2d';
            } else if (value < 0) {
                cell.style.backgroundColor = '#ffe8e8';
                cell.style.color = '#5a2d2d';
            } else {
                cell.style.backgroundColor = '#f0f0f0';
                cell.style.color = '#666';
            }
            conv2FilterKernel.appendChild(cell);
        });
    });
}

function createConv2InputPatch() {
    const conv2InputPatch = document.getElementById('conv2InputPatch');
    if (!conv2InputPatch) return;
    
    conv2InputPatch.innerHTML = '';
    
    // Sample pooled feature values (from Pool1 output)
    const pooledValues = [
        [0.8, 0.3, 0.7],
        [0.9, 0.5, 0.6],
        [0.4, 0.8, 0.2]
    ];
    
    pooledValues.forEach(row => {
        row.forEach(value => {
            const cell = document.createElement('div');
            cell.className = 'patch-value';
            cell.textContent = value.toFixed(1);
            
            // Color based on activation strength
            const intensity = Math.floor(value * 255);
            const colorValue = Math.max(100, intensity); // Ensure visibility
            cell.style.backgroundColor = `rgb(${colorValue}, ${colorValue}, 255)`;
            cell.style.color = value > 0.5 ? '#000' : '#fff';
            conv2InputPatch.appendChild(cell);
        });
    });
}

// Initialize Complete CNN Visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add to existing initialization
    if (document.querySelector('.cnn-complete-demo')) {
        initializeCompleteCNNVisualization();
    }
});