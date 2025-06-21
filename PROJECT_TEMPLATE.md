Create a professional, interactive educational website that visualizes and explains [ASSIGNMENT TOPIC] concepts. The website should follow these specifications:

STRUCTURE:
1. Hero section with animated title and brief description
2. Interactive concept visualizer/playground 
3. Jupyter notebook integration showing the actual code
4. Step-by-step visual explanations with animations
5. Key takeaways section

DESIGN REQUIREMENTS:
- Color scheme: Modern blue gradient (#0066FF to #004DCC) with white/light backgrounds
- Typography: Clean sans-serif (Inter or similar) with clear hierarchy
- Responsive design that works on all devices
- Smooth animations and transitions (using CSS animations or GSAP)
- Professional appearance matching top tech company standards

TECHNICAL FEATURES:
1. Interactive Visualizer:
   - Real-time parameter adjustment sliders/controls
   - Animated process visualization (e.g., for CNN: show convolution, pooling, layers)
   - Live output updates based on user input
   - Reset button to return to defaults

2. Code Integration:
   - Embedded Jupyter notebook viewer (use notebook.js or similar)
   - Syntax highlighting with Prism.js
   - Collapsible code sections
   - "Run" buttons that trigger visualizations

3. Educational Elements:
   - Progressive disclosure (start simple, add complexity)
   - Tooltips explaining technical terms on hover
   - Side-by-side comparison of input/output
   - Mathematical formulas rendered with KaTeX

4. Animations:
   - Smooth transitions between states
   - Step-through capability for complex processes
   - Play/pause controls for animations
   - Speed adjustment slider

SPECIFIC SECTIONS TO INCLUDE:

1. "What is [CONCEPT]?" - Simple explanation with animated diagram
2. "How it Works" - Step-by-step breakdown with visualizations
3. "Interactive Demo" - Hands-on playground
4. "See the Code" - Notebook integration
5. "Real-World Applications" - Practical examples
6. "Key Concepts" - Summary cards with icons

IMPLEMENTATION NOTES:
- Use vanilla JavaScript or lightweight libraries (no heavy frameworks)
- Optimize for fast loading (lazy load images, minify assets)
- Include loading states for interactive elements
- Add keyboard navigation support
- Ensure accessibility (ARIA labels, contrast ratios)

FILE STRUCTURE:
index.html - Main page
style.css - All styling
script.js - Interactivity and animations
assets/ - Images, notebooks, data files

Make the complex simple. Use metaphors and analogies. The goal is for someone with no ML background to understand the core concepts after exploring the site.