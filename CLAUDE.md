# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

**CNN Explorer** is an interactive educational web platform that teaches Convolutional Neural Networks through hands-on MNIST digit recognition. The project is built with vanilla web technologies for maximum compatibility and performance.

### Core Components

- **index.html**: Main interactive learning platform with scroll-based CNN visualization
- **notebook-interactive.html**: Comprehensive educational notebook with mobile-optimized design
- **script.js**: Primary interactive functionality with step-by-step CNN animations
- **ml-prediction.js**: Real TensorFlow.js integration for live digit recognition (digits 1-4)
- **visualizations.js**: Advanced visualizations and 3D CNN animations
- **styles.css**: Modern light theme with mobile-first responsive design
- **visualizations.css**: Additional styling for complex visualizations

### Architecture Patterns

The project uses a **modular vanilla JavaScript architecture** with:
- **Event-driven animations**: Each CNN step has independent play/pause/reset controls
- **Progressive disclosure**: Information revealed step-by-step through interactive elements
- **Real-time ML integration**: Live TensorFlow.js model inference with canvas preprocessing
- **Mobile-first responsive design**: Comprehensive touch optimization and safe area support

### Key Technical Features

- **Interactive CNN Pipeline**: 6-stage visualization (Input → Conv1 → Pool1 → Conv2 → Dense → Output)
- **Real AI Model**: TensorFlow.js MNIST CNN specialized for digits 1-4
- **Hyperparameter Controls**: Live adjustment of filter size, number of filters, activation threshold, pooling size
- **Mobile Excellence**: Touch-friendly controls, orientation handling, iPhone safe area support
- **Educational Glossary**: 36 terms across 4 sections with hover effects and mobile optimization

## Development Commands

### Local Development
```bash
# Start local development server
python3 -m http.server 8001

# Access application
open http://localhost:8001
```

### File Structure Navigation
- Main learning experience: `index.html`
- Educational notebook: `notebook-interactive.html`
- Real ML predictions: `ml-prediction.js`
- Interactive animations: `script.js`
- Visualizations: `visualizations.js`

### Testing the AI Model
The project includes a specialized TensorFlow.js CNN model:
- **Supported digits**: 1, 2, 3, 4 (optimized for high accuracy)
- **Input format**: 28×28 grayscale canvas drawings
- **Model file**: Loaded from Google TensorFlow.js model repository
- **Validation**: Automatic detection of out-of-range digits with user-friendly error messages

## Educational Platform Features

### Step-by-Step CNN Learning
1. **Input Processing**: Visual pixel-to-number conversion with interactive grid
2. **Feature Detection**: Live convolution animation with multiple filter types
3. **Pooling**: Max pooling visualization with sliding window animation
4. **Classification**: Neural network activation with confidence scoring

### Interactive Controls
- **Play/Pause/Reset**: Available for each learning step
- **Speed Control**: Adjustable animation speed (1x, 2x, 0.5x)
- **Progress Tracking**: Visual indicators for learning progression
- **Mobile Touch**: Optimized for tablet and mobile learning

### Real-Time AI Demo
- **Drawing Canvas**: HTML5 canvas with mouse and touch support
- **Live Prediction**: Actual TensorFlow.js model inference
- **Debug Visualization**: Shows both user drawing and AI input (28×28)
- **Smart Validation**: Handles unsupported digits with educational error messages

## Mobile-First Design

### Responsive Breakpoints
- **Desktop**: 1200px+ (full feature layout)
- **Tablet**: 768px-1199px (stacked architecture diagram)
- **Mobile**: 480px-767px (vertical flow, touch targets)
- **Small Mobile**: <480px (compact typography, optimized spacing)

### Touch Optimization
- **Minimum touch targets**: 44px for all interactive elements
- **Touch feedback**: Opacity changes and visual feedback
- **Safe area support**: iPhone notch/Dynamic Island compatibility
- **Orientation handling**: Automatic layout adjustment for landscape/portrait

### Mobile-Specific Features
- **Vertical architecture flow**: CNN diagram adapts to mobile screens
- **Enhanced copy functionality**: Clipboard API with fallbacks
- **Scalable typography**: Font sizes adapt across screen sizes
- **Touch-friendly navigation**: Mobile-optimized menu and controls

## Code Maintenance Guidelines

### Adding New CNN Steps
1. Create step initialization function in `script.js`
2. Add corresponding HTML structure in `index.html`
3. Update progress indicator system
4. Ensure mobile responsiveness in `styles.css`

### Extending AI Model Support
1. Update validation in `ml-prediction.js`
2. Modify error handling for new digit ranges
3. Update user interface limitations display
4. Test preprocessing pipeline compatibility

### Mobile Enhancement
1. Test on actual devices (iPhone, Android)
2. Verify touch targets meet 44px minimum
3. Check safe area handling for notched devices
4. Validate orientation change behavior

## Educational Content Standards

### Glossary System
- **Data Preparation**: 6 terms covering MNIST, normalization, preprocessing
- **CNN Architecture**: 9 terms covering layers, filters, activations
- **Training & Optimization**: 9 terms covering optimizers, loss functions, metrics
- **Predictions & Evaluation**: 9 terms covering inference, confidence, evaluation

### Learning Objectives
- Visual-numerical connection understanding
- Step-by-step CNN processing comprehension
- Interactive exploration capabilities
- Real-time ML model interaction
- Mobile-friendly educational experience

## Performance Considerations

### Optimization Techniques
- **Lazy loading**: Animations start only when needed
- **Memory management**: Proper tensor disposal in TensorFlow.js
- **Efficient DOM updates**: Minimal reflow/repaint operations
- **Mobile performance**: Touch-optimized event handling

### Browser Compatibility
- **Modern browsers**: Chrome, Firefox, Safari, Edge (ES6+ support required)
- **Mobile browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **TensorFlow.js**: Automatic WebGL/CPU fallback for older devices
- **Font Awesome**: CDN-loaded icons with fallback handling

## Deployment Notes

### Production Ready Features
- **Semantic HTML**: Proper structure for SEO and accessibility
- **Performance optimized**: Fast loading, efficient animations
- **Cross-platform**: Desktop, tablet, mobile compatibility
- **Educational excellence**: University-level learning depth
- **Professional design**: Clean, modern, consistent styling

### Hosting Requirements
- **Static hosting**: No server-side requirements
- **HTTPS**: Required for TensorFlow.js model loading
- **Modern browser support**: ES6+ JavaScript features
- **CDN compatibility**: Font Awesome, TensorFlow.js, Chart.js

The project represents a complete, production-ready educational platform that makes complex CNN concepts accessible through interactive visualization and real AI model integration.