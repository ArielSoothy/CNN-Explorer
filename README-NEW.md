# CNN Explorer

An interactive educational website for learning about Convolutional Neural Networks (CNNs).

## Features

- 🧠 Interactive CNN visualization
- 🎨 Draw-and-predict digit recognition
- 📊 Real-time layer visualization  
- 📱 Responsive design
- 🎯 Step-by-step learning process
- 💻 Clean, modular code architecture

## Project Structure

```
CNN/
├── index-new.html          # New improved HTML structure
├── src/
│   ├── js/
│   │   ├── main.js         # Main application entry point
│   │   └── config.js       # Configuration and utilities
│   ├── css/
│   │   ├── main.css        # Main styles
│   │   └── components.css  # Component-specific styles
│   └── components/
│       ├── CNNVisualization.js
│       ├── InteractiveDemo.js
│       ├── StepNavigation.js
│       ├── LoadingScreen.js
│       ├── Navigation.js
│       └── Utilities.js
├── assets/
│   └── images/
├── package.json
└── serve.py               # Development server
```

## Getting Started

### Prerequisites

- Python 3.6+
- Modern web browser with ES6 module support

### Installation

1. Clone or navigate to the project directory
2. No additional dependencies required - uses vanilla JavaScript and CDN resources

### Development

Start the development server:

```bash
python serve.py
```

Or using npm (if you have Node.js):

```bash
npm start
```

Open your browser and navigate to `http://localhost:8000`

### Using the New Structure

The project has been completely restructured for better maintainability:

1. **Modular Components**: Each feature is now a separate, reusable component
2. **Error Handling**: Robust error handling throughout the application
3. **ES6 Modules**: Modern JavaScript module system
4. **Responsive Design**: Better mobile support
5. **Performance**: Optimized loading and rendering

### Key Improvements

- ✅ Fixed HTML structure issues
- ✅ Modular JavaScript architecture
- ✅ Proper error handling and logging
- ✅ Responsive design improvements
- ✅ Better code organization
- ✅ ES6 modules for dependency management
- ✅ Debounced events for better performance
- ✅ Separation of concerns

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development Guidelines

### Adding New Components

1. Create a new file in `src/components/`
2. Import and initialize in `src/js/main.js`
3. Add styles in `src/css/components.css`

### Code Style

- Use ES6+ features
- Implement proper error handling
- Add console logging for debugging
- Follow the existing component pattern

### Testing

Currently no automated tests. Manual testing guidelines:

1. Test all interactive features
2. Verify responsive design on different screen sizes
3. Check console for errors
4. Test with different browsers

## Troubleshooting

### Common Issues

1. **Blank canvases**: Check browser console for JavaScript errors
2. **Animations not working**: Ensure external libraries (Three.js, GSAP) are loaded
3. **Mobile issues**: Check touch event handling in InteractiveDemo.js

### Debug Mode

The application includes comprehensive logging. Open browser dev tools to see detailed execution logs.

## Contributing

1. Follow the modular architecture
2. Add proper error handling
3. Update documentation
4. Test across browsers

## License

MIT License - feel free to use and modify for educational purposes.
