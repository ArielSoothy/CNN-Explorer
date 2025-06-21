// Loading Screen Component
import { CONFIG, Utils, ErrorHandler } from '../js/config.js';

export class LoadingScreen {
    constructor() {
        this.loadingElement = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.loadingElement = Utils.safeQuerySelector('#loading-screen');
            this.isInitialized = true;
            console.log('Loading Screen initialized successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'LoadingScreen.init');
        }
    }

    async hide() {
        if (!this.loadingElement) return;
        
        try {
            await Utils.animation.fadeOut(this.loadingElement, 500);
            console.log('Loading screen hidden');
        } catch (error) {
            ErrorHandler.handle(error, 'LoadingScreen.hide');
        }
    }

    show() {
        if (!this.loadingElement) return;
        
        try {
            this.loadingElement.style.display = 'flex';
            this.loadingElement.style.opacity = '1';
            console.log('Loading screen shown');
        } catch (error) {
            ErrorHandler.handle(error, 'LoadingScreen.show');
        }
    }
}
