// Main script for CNN Explorer
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeCanvas();
    initializeAnimations();
    initializeMobileMenu();
    initializeInteractiveSteps();
    initializeScrollToTop();
});

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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clearPredictionResults();
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
        const predictions = await window.mnistPredictor.predict(canvas);
        
        // Show results after a brief delay for better UX
        setTimeout(() => {
            displayPredictions(predictions, true);
        }, 500);
        
    } catch (error) {
        console.error('Prediction failed:', error);
        
        // Fallback to demo predictions if ML fails
        console.log('🔄 Falling back to demo predictions...');
        setTimeout(() => {
            const demoPredictions = window.mnistPredictor.generateDemoPredictions();
            displayPredictions(demoPredictions, false);
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

function clearPredictionResults() {
    const resultsContainer = document.getElementById('predictionResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="prediction-placeholder">
                <i class="fas fa-arrow-left"></i>
                <p>Draw a digit and click "Predict" to see the magic!</p>
            </div>
        `;
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
    // Initialize scroll-based progress tracking
    initializeScrollProgress();
    
    // Initialize all step functionalities immediately
    initializePixelGrid();
    initializeConvolution();
    initializePooling();
    initializeClassification();
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
            0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
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
        0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
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