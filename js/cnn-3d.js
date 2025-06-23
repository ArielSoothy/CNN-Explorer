// CNNVision - 3D CNN Visualization

class CNN3DVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isAnimating = false;
        this.networkElements = {};
        this.currentView = 'perspective';
        this.cameraPositions = {
            perspective: { x: 0, y: 5, z: 12 },
            side: { x: 0, y: 5, z: -15 }
        };
        this.targetCameraPosition = { x: 0, y: 5, z: 12 };
        this.cameraTransitionSpeed = 0.15;
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('3D container not found');
            return;
        }

        this.setupScene();
        this.createCNNArchitecture();
        this.setupLighting();
        this.setupControls();
        this.startRenderLoop();
        this.bindEvents();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }

    createCNNArchitecture() {
        // Improved network architecture with better proportions
        const layers = [
            { type: 'input', size: [6, 6, 1], position: [-6, 0, 0], color: 0x00ff88 },
            { type: 'conv', size: [4, 4, 8], position: [-2, 0, 0], color: 0x0066ff },
            { type: 'pool', size: [3, 3, 8], position: [1, 0, 0], color: 0x4400ff },
            { type: 'conv', size: [2, 2, 16], position: [3.5, 0, 0], color: 0x0066ff },
            { type: 'dense', size: [1, 1, 10], position: [6, 0, 0], color: 0xff6600 }
        ];

        // Create layer visualizations
        layers.forEach((layer, index) => {
            const layerGroup = this.createLayer(layer);
            layerGroup.name = `layer_${index}_${layer.type}`;
            this.scene.add(layerGroup);
            this.networkElements[`layer${index}`] = layerGroup; // Use consistent naming
        });

        // Create connections between layers
        this.createConnections(layers);
    }

    createLayer(layerConfig) {
        const group = new THREE.Group();
        const { size, position, color, type } = layerConfig;
        const [width, height, depth] = size;

        if (type === 'input') {
            // Create larger, more visible input layer
            const pixelSize = 0.15;
            const spacing = 0.18;
            
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const geometry = new THREE.BoxGeometry(pixelSize, pixelSize, pixelSize);
                    const material = new THREE.MeshLambertMaterial({ 
                        color: color,
                        transparent: true,
                        opacity: 0.9
                    });
                    const pixel = new THREE.Mesh(geometry, material);
                    
                    pixel.position.set(
                        (x - width/2) * spacing,
                        (y - height/2) * spacing,
                        0
                    );
                    
                    // Store reference for activation animation
                    pixel.userData = { 
                        originalColor: new THREE.Color(color),
                        originalOpacity: 0.9,
                        layerType: 'input'
                    };
                    
                    group.add(pixel);
                }
            }
        } else if (type === 'dense') {
            // Create larger, more visible dense layer
            for (let i = 0; i < depth; i++) {
                const geometry = new THREE.SphereGeometry(0.12, 12, 8);
                const material = new THREE.MeshLambertMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: 0.9
                });
                const neuron = new THREE.Mesh(geometry, material);
                
                neuron.position.set(0, (i - depth/2) * 0.25, 0);
                
                // Store reference for activation animation
                neuron.userData = { 
                    originalColor: new THREE.Color(color),
                    originalOpacity: 0.9,
                    layerType: 'dense'
                };
                
                group.add(neuron);
            }
        } else {
            // Create more visible conv/pool layers with feature map representation
            const layerSpacing = 0.12;
            const layerSize = Math.max(width * 0.25, 0.5);
            const featureMapsToShow = Math.min(depth, 6); // Show fewer for clarity
            
            for (let d = 0; d < featureMapsToShow; d++) {
                const geometry = new THREE.PlaneGeometry(layerSize, layerSize);
                const material = new THREE.MeshLambertMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                const featureMap = new THREE.Mesh(geometry, material);
                
                featureMap.position.set(0, 0, d * layerSpacing - (featureMapsToShow * layerSpacing) / 2);
                
                // Store reference for activation animation
                featureMap.userData = { 
                    originalColor: new THREE.Color(color),
                    originalOpacity: 0.8,
                    layerType: type,
                    featureMapIndex: d
                };
                
                group.add(featureMap);
                
                // Add subtle grid pattern to show feature detection areas
                if (type === 'conv' && d === 0) { // Only for the front feature map
                    const gridHelper = this.createFeatureMapGrid(layerSize);
                    gridHelper.position.copy(featureMap.position);
                    gridHelper.position.z += 0.01; // Slightly in front
                    group.add(gridHelper);
                }
            }
            
            // Add depth indicator for layers with many feature maps
            if (depth > featureMapsToShow) {
                const depthText = this.createDepthIndicator(depth, layerSize);
                depthText.position.set(layerSize * 0.6, layerSize * 0.6, 0);
                group.add(depthText);
            }
        }

        group.position.set(...position);
        return group;
    }

    createConnections(layers) {
        // Create connections between adjacent layers
        for (let i = 0; i < layers.length - 1; i++) {
            const startPos = layers[i].position;
            const endPos = layers[i + 1].position;
            
            const connection = this.createConnection(startPos, endPos);
            connection.name = `connection_${i}`;
            this.scene.add(connection);
            this.networkElements[`connection_${i}`] = connection;
        }
    }

    createConnection(startPos, endPos) {
        const group = new THREE.Group();
        
        // Create multiple connection lines for visual effect
        for (let i = 0; i < 3; i++) {
            const points = [
                new THREE.Vector3(...startPos),
                new THREE.Vector3(...endPos)
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
                color: 0x4444ff,
                transparent: true,
                opacity: 0.3
            });
            
            const line = new THREE.Line(geometry, material);
            line.position.y += (i - 1) * 0.1;
            group.add(line);
        }
        
        return group;
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);

        // Point light for accent
        const pointLight = new THREE.PointLight(0x0066ff, 0.5, 100);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);
    }

    setupControls() {
        // Auto-rotation
        this.autoRotation = {
            enabled: true,
            speed: 0.0015
        };
        
        // Mouse interaction for manual rotation
        this.mousePosition = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };
        
        this.container.addEventListener('mousemove', (event) => {
            const rect = this.container.getBoundingClientRect();
            this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.targetRotation.y = this.mousePosition.x * 0.3;
            this.targetRotation.x = this.mousePosition.y * 0.2;
        });

        this.container.addEventListener('mouseleave', () => {
            this.targetRotation.x = 0;
            this.targetRotation.y = 0;
        });
    }

    bindEvents() {
        // Play button
        const playButton = document.getElementById('play-cnn-animation');
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.toggleAnimation();
            });
        }

        // Camera view button (single side view toggle)
        const sideViewButton = document.getElementById('camera-side');
        if (sideViewButton) {
            sideViewButton.addEventListener('click', () => {
                if (this.currentView === 'perspective') {
                    this.switchCameraView('side');
                    sideViewButton.classList.add('active');
                    sideViewButton.innerHTML = '<span>3D View</span>';
                } else {
                    this.switchCameraView('perspective');
                    sideViewButton.classList.remove('active');
                    sideViewButton.innerHTML = '<span>Side View</span>';
                }
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Improve mouse controls for better integration
        this.setupEnhancedControls();
    }

    switchCameraView(view) {
        this.currentView = view;
        const position = this.cameraPositions[view];
        this.targetCameraPosition = { ...position };
        
        // Reset manual rotation when switching views
        this.manualRotation = null;
        
        // Disable auto-rotation for manual views
        if (view !== 'perspective') {
            this.autoRotation.enabled = false;
        } else {
            this.autoRotation.enabled = true;
        }
    }

    setupEnhancedControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
            this.container.style.cursor = 'grabbing';
        });

        this.container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            // Manual camera rotation
            this.manualRotation = this.manualRotation || { x: 0, y: 0 };
            this.manualRotation.y += deltaX * 0.01;
            this.manualRotation.x += deltaY * 0.01;
            
            // Limit vertical rotation
            this.manualRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.manualRotation.x));
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
            
            // Disable auto-rotation when manually controlling
            this.autoRotation.enabled = false;
        });

        this.container.addEventListener('mouseup', () => {
            isDragging = false;
            this.container.style.cursor = 'grab';
        });

        this.container.addEventListener('mouseleave', () => {
            isDragging = false;
            this.container.style.cursor = 'default';
        });

        // Add grab cursor
        this.container.style.cursor = 'grab';
        
        // Reset to auto-rotation after inactivity
        let inactivityTimer;
        this.container.addEventListener('mousemove', () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (this.currentView === 'perspective') {
                    this.autoRotation.enabled = true;
                }
            }, 3000);
        });
    }

    toggleAnimation() {
        if (this.isAnimating) {
            this.stopDataFlowAnimation();
        } else {
            this.startDataFlowAnimation();
        }
    }

    startDataFlowAnimation() {
        this.isAnimating = true;
        const playButton = document.getElementById('play-cnn-animation');
        const wrapper = document.querySelector('.cnn-3d-wrapper');
        
        if (playButton) {
            playButton.innerHTML = `
                <svg class="play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <span>Pause Animation</span>
            `;
        }
        
        if (wrapper) {
            wrapper.classList.add('playing');
        }

        // Create data particles
        this.createDataParticles();
    }

    stopDataFlowAnimation() {
        this.isAnimating = false;
        const playButton = document.getElementById('play-cnn-animation');
        const wrapper = document.querySelector('.cnn-3d-wrapper');
        
        if (playButton) {
            playButton.innerHTML = `
                <svg class="play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
                <span>Watch Data Flow</span>
            `;
        }
        
        if (wrapper) {
            wrapper.classList.remove('playing');
        }

        // Remove data particles
        this.clearDataParticles();
    }

    createDataParticles() {
        this.dataParticles = [];
        
        // Create more visible particles with better flow
        for (let i = 0; i < 15; i++) {
            const geometry = new THREE.SphereGeometry(0.04, 8, 6);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.9
            });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.set(-6, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 0.5);
            particle.userData = {
                speed: 0.025 + Math.random() * 0.015,
                startTime: Date.now() + i * 300,
                originalY: (Math.random() - 0.5) * 3,
                originalZ: (Math.random() - 0.5) * 0.5
            };
            
            this.scene.add(particle);
            this.dataParticles.push(particle);
        }
    }

    clearDataParticles() {
        if (this.dataParticles) {
            this.dataParticles.forEach(particle => {
                this.scene.remove(particle);
            });
            this.dataParticles = [];
        }
    }

    animateDataParticles() {
        if (!this.dataParticles || !this.isAnimating) return;
        
        const currentTime = Date.now();
        
        this.dataParticles.forEach(particle => {
            if (currentTime > particle.userData.startTime) {
                particle.position.x += particle.userData.speed;
                
                // Reset particle when it reaches the end
                if (particle.position.x > 6.5) {
                    particle.position.x = -6.5;
                    particle.position.y = particle.userData.originalY;
                    particle.position.z = particle.userData.originalZ;
                }
                
                // Add pulsing effect to show data transformation
                const progress = (particle.position.x + 6.5) / 13; // 0 to 1
                const pulse = 1 + Math.sin(currentTime * 0.008 + progress * 8) * 0.4;
                particle.scale.setScalar(pulse);
                
                // Color change to show data transformation
                const hue = 0.5 + progress * 0.3; // Cyan to orange spectrum
                particle.material.color.setHSL(hue, 1, 0.5);
                
                // Trigger layer activations as particles pass through
                this.animateLayerActivations(particle.position.x, currentTime);
            }
        });
    }

    animateLayerActivations(particleX, currentTime) {
        // Define layer positions and their activation triggers
        const layerPositions = [-4, -2, 0, 2, 4, 6];
        const activationThreshold = 0.3;
        
        layerPositions.forEach((layerX, index) => {
            if (Math.abs(particleX - layerX) < activationThreshold) {
                this.triggerLayerActivation(index, currentTime);
            }
        });
    }

    triggerLayerActivation(layerIndex, currentTime) {
        const layer = this.networkElements[`layer${layerIndex}`];
        if (!layer) return;
        
        // Create activation effect for this layer
        layer.children.forEach((child, childIndex) => {
            if (child.material) {
                // Create pulsing activation effect
                const delay = childIndex * 50; // Stagger the activations
                const activationKey = `${layerIndex}-${childIndex}`;
                
                if (!this.layerActivations) this.layerActivations = {};
                
                // Only trigger if not recently activated
                if (!this.layerActivations[activationKey] || 
                    currentTime - this.layerActivations[activationKey] > 1000) {
                    
                    this.layerActivations[activationKey] = currentTime;
                    
                    setTimeout(() => {
                        if (child.material && this.isAnimating) {
                            // Store original properties
                            const originalOpacity = child.material.opacity;
                            const originalColor = child.material.color.clone();
                            
                            // Create activation animation
                            const activationDuration = 500;
                            const startTime = Date.now();
                            
                            const animateActivation = () => {
                                if (!this.isAnimating) return;
                                
                                const elapsed = Date.now() - startTime;
                                const progress = Math.min(elapsed / activationDuration, 1);
                                
                                if (progress < 0.5) {
                                    // Pulse up
                                    const intensity = progress * 2;
                                    child.material.opacity = originalOpacity + (1 - originalOpacity) * intensity;
                                    child.material.color.lerpColors(originalColor, new THREE.Color(0xffffff), intensity * 0.5);
                                } else {
                                    // Pulse down
                                    const intensity = (1 - progress) * 2;
                                    child.material.opacity = originalOpacity + (1 - originalOpacity) * intensity;
                                    child.material.color.lerpColors(originalColor, new THREE.Color(0xffffff), intensity * 0.5);
                                }
                                
                                if (progress < 1) {
                                    requestAnimationFrame(animateActivation);
                                } else {
                                    // Reset to original
                                    child.material.opacity = originalOpacity;
                                    child.material.color = originalColor;
                                }
                            };
                            
                            animateActivation();
                        }
                    }, delay);
                }
            }
        });
    }

    createFeatureMapGrid(size) {
        const gridSize = 4;
        const spacing = size / gridSize;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        
        // Create grid lines to show feature detection areas
        for (let i = 0; i <= gridSize; i++) {
            const pos = (i - gridSize/2) * spacing;
            // Horizontal lines
            positions.push(-size/2, pos, 0);
            positions.push(size/2, pos, 0);
            // Vertical lines
            positions.push(pos, -size/2, 0);
            positions.push(pos, size/2, 0);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({ 
            color: 0x666666, 
            transparent: true, 
            opacity: 0.4 
        });
        
        return new THREE.LineSegments(geometry, material);
    }

    createDepthIndicator(depth, size) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        
        // Create a subtle background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 64, 24);
        
        // Add depth number
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`×${depth}`, 32, 16);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            opacity: 0.9
        });
        const geometry = new THREE.PlaneGeometry(size * 0.4, size * 0.2);
        
        return new THREE.Mesh(geometry, material);
    }

    startRenderLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            // Smooth camera position transitions
            this.updateCameraPosition();
            
            // Animate data particles
            this.animateDataParticles();
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    updateCameraPosition() {
        if (this.currentView === 'perspective') {
            if (this.autoRotation.enabled && !this.manualRotation) {
                // Auto-rotation for perspective view
                const time = Date.now() * this.autoRotation.speed;
                this.camera.position.x = Math.cos(time) * 12;
                this.camera.position.z = Math.sin(time) * 12;
                this.camera.position.y = 5;
            } else if (this.manualRotation) {
                // Manual rotation
                const radius = 12;
                this.camera.position.x = Math.cos(this.manualRotation.y) * Math.cos(this.manualRotation.x) * radius;
                this.camera.position.y = Math.sin(this.manualRotation.x) * radius + 5;
                this.camera.position.z = Math.sin(this.manualRotation.y) * Math.cos(this.manualRotation.x) * radius;
            }
        } else {
            // Smooth transition to target position for other views
            this.camera.position.x += (this.targetCameraPosition.x - this.camera.position.x) * this.cameraTransitionSpeed;
            this.camera.position.y += (this.targetCameraPosition.y - this.camera.position.y) * this.cameraTransitionSpeed;
            this.camera.position.z += (this.targetCameraPosition.z - this.camera.position.z) * this.cameraTransitionSpeed;
        }
        
        // Always look at the center of the network
        this.camera.lookAt(0, 0, 0);
    }

    handleResize() {
        if (!this.container) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Method to make visualization respond to scroll
    adjustForScroll(scrollProgress) {
        // Don't adjust camera if not in perspective view
        if (this.currentView !== 'perspective') {
            return;
        }
        
        // Subtle rotation based on scroll position
        if (this.autoRotation.enabled) {
            const baseRotation = Date.now() * this.autoRotation.speed;
            const scrollInfluence = scrollProgress * Math.PI / 4; // Up to 45 degrees
            
            this.camera.position.x = Math.cos(baseRotation + scrollInfluence) * 15;
            this.camera.position.z = Math.sin(baseRotation + scrollInfluence) * 15;
            this.camera.position.y = 5 + scrollProgress * 2; // Slight height change
        }
        
        // Adjust network opacity based on scroll
        if (this.scene) {
            Object.values(this.networkElements).forEach(element => {
                if (element && element.children) {
                    element.children.forEach(child => {
                        if (child.material) {
                            child.material.opacity = 0.8 + (scrollProgress * 0.2);
                        }
                    });
                }
            });
        }
    }

    dispose() {
        // Clean up resources
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.clearDataParticles();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Initialize 3D visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Wait a bit for the container to be properly sized
        setTimeout(() => {
            window.cnn3D = new CNN3DVisualizer('cnn-3d-canvas');
            console.log('3D CNN visualization initialized');
        }, 100);
    } catch (error) {
        console.error('Failed to initialize 3D visualization:', error);
        
        // Show fallback content
        const container = document.getElementById('cnn-3d-canvas');
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center;">
                    <div>
                        <h3>3D Visualization Unavailable</h3>
                        <p>Your browser doesn't support WebGL or 3D graphics.</p>
                        <p>The educational content is still available below!</p>
                    </div>
                </div>
            `;
        }
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.cnn3D) {
        window.cnn3D.dispose();
    }
});
