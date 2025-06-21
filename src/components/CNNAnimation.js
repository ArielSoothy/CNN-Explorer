// CNN Animation Component - THREE.js Landing Page Animation
import { CONFIG, Utils, ErrorHandler } from '../js/config.js';

export class CNNAnimation {
    constructor() {
        this.container = document.getElementById('cnn-animation-container');
        if (!this.container) {
            console.warn('CNN animation container not found');
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.layers = [];
        this.animationId = null;
        
        this.init();
    }

    init() {
        try {
            if (typeof THREE === 'undefined') {
                console.error('THREE.js not loaded');
                return;
            }
            
            this.setupScene();
            this.createCNN();
            this.animate();
            console.log('CNN Animation initialized successfully');
        } catch (error) {
            ErrorHandler.log('Error setting up THREE.js animation', error);
        }
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 15;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(5, 10, 15);
        this.scene.add(pointLight);

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    createCNN() {
        this.layers = [];
        const layerSpacing = 4;
        const layerColors = [0x0066FF, 0x00AADD, 0x00EEFF];

        // Input Layer (28x28 representation)
        const inputLayer = this.createLayer(32, 32, 0.1, layerColors[0]);
        inputLayer.position.x = -layerSpacing * 1.5;
        this.scene.add(inputLayer);
        this.layers.push(inputLayer);

        // Convolutional/Pooling Layers
        for (let i = 0; i < 2; i++) {
            const layer = this.createLayer(20 - i * 8, 20 - i * 8, 1.5, layerColors[1]);
            layer.position.x = -layerSpacing * 0.5 + i * layerSpacing;
            this.scene.add(layer);
            this.layers.push(layer);
        }

        // Dense/Output Layer
        const denseLayer = this.createLayer(1, 10, 0.2, layerColors[2]);
        denseLayer.position.x = layerSpacing * 1.5;
        this.scene.add(denseLayer);
        this.layers.push(denseLayer);
    }

    createLayer(width, height, depth, color) {
        const group = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshStandardMaterial({ 
            color, 
            transparent: true, 
            opacity: 0.8 
        });

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(
                    (i - width / 2) * 0.2,
                    (j - height / 2) * 0.2,
                    (Math.random() - 0.5) * depth
                );
                group.add(mesh);
            }
        }
        return group;
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        // Animate layers
        if (this.layers) {
            this.layers.forEach((layer, index) => {
                layer.rotation.y += 0.001 * (index + 1);
                layer.rotation.x += 0.001 * (index + 1);
            });
        }

        // Animate scene
        if (this.scene) {
            this.scene.rotation.y += 0.0005;
        }

        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    destroy() {
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize.bind(this));

        // Clean up THREE.js objects
        if (this.renderer) {
            if (this.container && this.renderer.domElement) {
                this.container.removeChild(this.renderer.domElement);
            }
            this.renderer.dispose();
        }

        if (this.scene) {
            this.scene.clear();
        }

        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.layers = [];
    }
}
