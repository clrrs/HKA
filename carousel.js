/**
 * Accessible Carousel Controller
 * Helen Keller Archive Kiosk Application
 * 
 * Supports Tab/Shift+Tab navigation with Enter activation
 * Full VoiceOver/screen reader support
 */

class CarouselController {
    constructor(element, images) {
        this.carousel = element;
        this.images = images;
        
        // State
        this.state = {
            currentLayer: '1',
            currentSlide: 0,
            zoomLevel: 0,           // -300 to +300 (0 = fit to screen)
            panPosition: { x: 0, y: 0 }, // percentage offset
            autoPlayTimer: null,
            autoPlayInterval: 3000,  // 3 seconds
            isAutoPlaying: false,
            holdTimer: null,
            holdInterval: null
        };
        
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize
        this.init();
    }
    
    cacheElements() {
        // Layers
        this.layer1 = this.carousel.querySelector('.carousel-layer-1');
        this.layer2 = this.carousel.querySelector('.carousel-layer-2');
        this.layer3 = this.carousel.querySelector('.carousel-layer-3');
        
        // Layer 1 elements
        this.viewport = this.layer1.querySelector('.carousel-viewport');
        this.viewportImages = this.viewport.querySelectorAll('img');
        this.indicators = this.layer1.querySelectorAll('.indicator');
        this.prompt = this.layer1.querySelector('.carousel-prompt');
        
        // Layer 2 elements
        this.layer2ImageDisplay = this.layer2.querySelector('.carousel-image-display');
        this.layer2Image = this.layer2ImageDisplay.querySelector('img');
        this.layer2Indicators = this.layer2.querySelectorAll('.indicator');
        this.layer2Menu = this.layer2.querySelector('.carousel-menu');
        this.layer2Buttons = this.layer2Menu.querySelectorAll('button');
        
        // Layer 3 elements
        this.layer3Image = this.layer3.querySelector('.zoomable-image');
        this.layer3Menu = this.layer3.querySelector('.carousel-menu');
        this.layer3Buttons = this.layer3Menu.querySelectorAll('button');
        
        // Announcer
        this.announcer = this.carousel.querySelector('#carousel-announcer');
    }
    
    init() {
        // Set up event listeners
        this.setupLayer1Events();
        this.setupLayer2Events();
        this.setupLayer3Events();
        
        // Hide indicators if only one image
        if (this.images.length <= 1) {
            const indicatorsContainer1 = this.layer1.querySelector('.carousel-indicators');
            if (indicatorsContainer1) {
                indicatorsContainer1.style.display = 'none';
            }
            const indicatorsContainer2 = this.layer2.querySelector('.carousel-indicators');
            if (indicatorsContainer2) {
                indicatorsContainer2.style.display = 'none';
            }
        }
        
        // Start auto-play (only if multiple images)
        if (this.images.length > 1) {
            this.startAutoPlay();
            this.carousel.setAttribute('data-autoplay', 'true');
        } else {
            this.carousel.setAttribute('data-autoplay', 'false');
        }
        
        // Initial state
        this.updateCarouselDisplay();
    }
    
    // ============================================
    // ANNOUNCER
    // ============================================
    
    announce(message) {
        // Clear and re-set to ensure announcement fires
        this.announcer.textContent = '';
        setTimeout(() => {
            this.announcer.textContent = message;
        }, 50);
    }
    
    // ============================================
    // LAYER MANAGEMENT
    // ============================================
    
    setLayer(layerId) {
        const layers = {
            '1': this.layer1,
            '2': this.layer2,
            '3': this.layer3
        };
        
        // Deactivate all layers
        Object.values(layers).forEach(layer => {
            layer.setAttribute('data-active', 'false');
            layer.setAttribute('aria-hidden', 'true');
        });
        
        // Activate target layer
        const targetLayer = layers[layerId];
        targetLayer.setAttribute('data-active', 'true');
        targetLayer.setAttribute('aria-hidden', 'false');
        
        // Update carousel data attribute
        this.carousel.setAttribute('data-layer', layerId);
        this.state.currentLayer = layerId;
        
        // Focus management
        setTimeout(() => {
            this.setFocusForLayer(layerId);
        }, 100);
    }
    
    setFocusForLayer(layerId) {
        switch(layerId) {
            case '1':
                this.carousel.focus();
                break;
            case '2':
                this.layer2Buttons[0].focus();
                break;
            case '3':
                this.layer3Buttons[0].focus();
                break;
        }
    }
    
    // ============================================
    // LAYER 1: AUTO-CAROUSEL
    // ============================================
    
    setupLayer1Events() {
        // Focus events
        this.carousel.addEventListener('focus', () => {
            if (this.state.currentLayer === '1') {
                this.stopAutoPlay();
                this.prompt.classList.remove('hidden');
                this.carousel.setAttribute('data-autoplay', 'false');
                this.announce(`2 Images. Press Enter to explore.`);
            }
        });
        
        this.carousel.addEventListener('blur', (e) => {
            // Only restart if leaving carousel entirely and still on layer 1
            if (this.state.currentLayer === '1' && !this.carousel.contains(e.relatedTarget)) {
                this.startAutoPlay();
                this.carousel.setAttribute('data-autoplay', 'true');
            }
        });
        
        // Mouse hover
        this.carousel.addEventListener('mouseenter', () => {
            if (this.state.currentLayer === '1') {
                this.stopAutoPlay();
                this.carousel.setAttribute('data-autoplay', 'false');
            }
        });
        
        this.carousel.addEventListener('mouseleave', () => {
            if (this.state.currentLayer === '1' && document.activeElement !== this.carousel) {
                this.startAutoPlay();
                this.carousel.setAttribute('data-autoplay', 'true');
            }
        });
        
        // Enter key to transition to Layer 2
        this.carousel.addEventListener('keydown', (e) => {
            if (this.state.currentLayer === '1' && e.key === 'Enter') {
                e.preventDefault();
                this.enterLayer2();
            }
        });
    }
    
    startAutoPlay() {
        if (this.state.autoPlayTimer) {
            clearInterval(this.state.autoPlayTimer);
        }
        
        this.state.isAutoPlaying = true;
        this.state.autoPlayTimer = setInterval(() => {
            this.nextSlide(false); // false = don't announce
        }, this.state.autoPlayInterval);
    }
    
    stopAutoPlay() {
        if (this.state.autoPlayTimer) {
            clearInterval(this.state.autoPlayTimer);
            this.state.autoPlayTimer = null;
        }
        this.state.isAutoPlaying = false;
    }
    
    nextSlide(shouldAnnounce = true) {
        this.state.currentSlide = (this.state.currentSlide + 1) % this.images.length;
        this.updateCarouselDisplay();
        if (shouldAnnounce) {
            this.announceCurrentImage();
        }
    }
    
    prevSlide(shouldAnnounce = true) {
        this.state.currentSlide = this.state.currentSlide === 0 
            ? this.images.length - 1 
            : this.state.currentSlide - 1;
        this.updateCarouselDisplay();
        if (shouldAnnounce) {
            this.announceCurrentImage();
        }
    }
    
    updateCarouselDisplay() {
        const currentImage = this.images[this.state.currentSlide];
        
        // Update Layer 1 viewport
        this.viewportImages.forEach((img, index) => {
            img.style.display = index === this.state.currentSlide ? 'block' : 'none';
        });
        
        // Update Layer 1 indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.state.currentSlide);
        });
        
        // Update Layer 2 image
        this.layer2Image.src = currentImage.src;
        this.layer2Image.alt = currentImage.alt;
        
        // Update Layer 2 indicators
        this.layer2Indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.state.currentSlide);
        });
        
        // Update Layer 3 image
        this.layer3Image.src = currentImage.src;
        this.layer3Image.alt = currentImage.alt;
    }
    
    announceCurrentImage() {
        const image = this.images[this.state.currentSlide];
        this.announce(`Image ${this.state.currentSlide + 1} of ${this.images.length}. ${image.alt}`);
    }
    
    // ============================================
    // LAYER 2: NAVIGATION MODE
    // ============================================
    
    enterLayer2() {
        this.stopAutoPlay();
        
        // Hide prev/next buttons if only one image
        if (this.images.length === 1) {
            this.layer2Buttons.forEach(btn => {
                if (btn.dataset.action === 'prev' || btn.dataset.action === 'next') {
                    btn.style.display = 'none';
                }
            });
        }
        
        this.setLayer('2');
        
        const image = this.images[this.state.currentSlide];
        if (this.images.length === 1) {
            this.announce(`Viewing mode. ${image.alt}. Use Tab and Shift Tab to navigate menu. Exit or Zoom.`);
        } else {
            this.announce(`Navigation mode. Image ${this.state.currentSlide + 1} of ${this.images.length}. ${image.alt}. Use Tab and Shift Tab to navigate menu. Exit, Previous, Next, or Zoom.`);
        }
    }
    
    setupLayer2Events() {
        // Focus trap
        this.layer2.addEventListener('keydown', (e) => {
            if (this.state.currentLayer !== '2') return;
            this.handleFocusTrap(e, this.layer2Buttons);
        });
        
        // Button actions - use click which fires on both mouse click and Enter key
        this.layer2Buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (this.state.currentLayer !== '2') return;
                e.preventDefault();
                this.handleLayer2Action(button.dataset.action);
            });
        });
    }
    
    handleLayer2Action(action) {
        switch(action) {
            case 'exit':
                this.exitToLayer1();
                break;
            case 'prev':
                this.prevSlide(true);
                break;
            case 'next':
                this.nextSlide(true);
                break;
            case 'zoom':
                this.enterLayer3();
                break;
        }
    }
    
    exitToLayer1() {
        this.setLayer('1');
        this.startAutoPlay();
        this.carousel.setAttribute('data-autoplay', 'true');
        this.announce('Exited navigation mode.');
    }
    
    // ============================================
    // LAYER 3: ZOOM MODE (CONSOLIDATED CONTROLS)
    // ============================================
    
    enterLayer3() {
        // Reset zoom and pan state
        this.state.zoomLevel = 0;
        this.state.panPosition = { x: 0, y: 0 };
        this.updateZoomTransform();
        
        this.setLayer('3');
        this.updateZoomButtonStates();
        this.updatePanButtonStates();
        
        const image = this.images[this.state.currentSlide];
        this.announce(`Zoom mode. ${image.alt}. Full screen. Use controls to zoom and pan.`);
    }
    
    setupLayer3Events() {
        // Focus trap
        this.layer3.addEventListener('keydown', (e) => {
            if (this.state.currentLayer !== '3') return;
            this.handleFocusTrap(e, this.layer3Buttons);
        });
        
        // Button actions with hold-to-repeat for pan/zoom
        this.layer3Buttons.forEach(button => {
            const action = button.dataset.action;
            
            // Click handler
            button.addEventListener('click', () => {
                if (this.state.currentLayer !== '3') return;
                this.handleLayer3Action(action);
            });
            
            // Keydown for Enter - with hold-to-repeat for pan and zoom
            button.addEventListener('keydown', (e) => {
                if (this.state.currentLayer !== '3') return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    
                    // For pan/zoom directions, start hold-to-repeat
                    if (['pan-up', 'pan-down', 'pan-left', 'pan-right', 'zoom-in', 'zoom-out'].includes(action)) {
                        if (!this.state.holdTimer) {
                            this.handleLayer3Action(action);
                            this.startHoldToRepeat(() => this.handleLayer3Action(action));
                        }
                    } else {
                        this.handleLayer3Action(action);
                    }
                }
            });
            
            // Keyup to stop hold-to-repeat
            button.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.stopHoldToRepeat();
                }
            });
            
            // Stop hold on blur
            button.addEventListener('blur', () => {
                this.stopHoldToRepeat();
            });
        });
    }
    
    handleLayer3Action(action) {
        switch(action) {
            case 'exit':
                this.exitToLayer2();
                break;
            case 'zoom-in':
                this.zoomIn();
                break;
            case 'zoom-out':
                this.zoomOut();
                break;
            case 'pan-up':
                this.pan('up');
                break;
            case 'pan-down':
                this.pan('down');
                break;
            case 'pan-left':
                this.pan('left');
                break;
            case 'pan-right':
                this.pan('right');
                break;
            case 'reset':
                this.resetZoom();
                break;
        }
    }
    
    exitToLayer2() {
        this.setLayer('2');
        this.announce('Exited zoom mode.');
    }
    
    // ============================================
    // ZOOM CONTROLS
    // ============================================
    
    zoomIn() {
        if (this.state.zoomLevel >= 300) {
            this.announce('Maximum zoom.');
            return;
        }
        
        this.state.zoomLevel = Math.min(this.state.zoomLevel + 25, 300);
        this.updateZoomTransform();
        this.updateZoomButtonStates();
        this.updatePanButtonStates();
        this.announce(`Zoomed in. ${this.state.zoomLevel} percent.`);
    }
    
    zoomOut() {
        if (this.state.zoomLevel <= -300) {
            this.announce('Minimum zoom.');
            return;
        }
        
        this.state.zoomLevel = Math.max(this.state.zoomLevel - 25, -300);
        
        // Reset pan if zooming out past the point where panning is useful
        const maxPan = this.getMaxPan();
        if (Math.abs(this.state.panPosition.x) > maxPan.x) {
            this.state.panPosition.x = Math.sign(this.state.panPosition.x) * maxPan.x;
        }
        if (Math.abs(this.state.panPosition.y) > maxPan.y) {
            this.state.panPosition.y = Math.sign(this.state.panPosition.y) * maxPan.y;
        }
        
        this.updateZoomTransform();
        this.updateZoomButtonStates();
        this.updatePanButtonStates();
        this.announce(`Zoomed out. ${this.state.zoomLevel} percent.`);
    }
    
    resetZoom() {
        this.state.zoomLevel = 0;
        this.state.panPosition = { x: 0, y: 0 };
        this.updateZoomTransform();
        this.updateZoomButtonStates();
        this.updatePanButtonStates();
        this.announce('Reset. Fit to screen.');
    }
    
    updateZoomButtonStates() {
        this.layer3Buttons.forEach(button => {
            const action = button.dataset.action;
            let disabled = false;
            
            switch(action) {
                case 'zoom-in':
                    disabled = this.state.zoomLevel >= 300;
                    break;
                case 'zoom-out':
                    disabled = this.state.zoomLevel <= -300;
                    break;
            }
            
            if (action === 'zoom-in' || action === 'zoom-out') {
                button.disabled = disabled;
                if (disabled) {
                    button.setAttribute('aria-disabled', 'true');
                } else {
                    button.removeAttribute('aria-disabled');
                }
            }
        });
    }
    
    updateZoomTransform() {
        // Convert zoom level to scale
        // -300% = 0.25x, 0% = 1x, +300% = 4x
        const scale = 1 + (this.state.zoomLevel / 100);
        const clampedScale = Math.max(0.25, scale);
        
        const { x, y } = this.state.panPosition;
        
        const transform = `scale(${clampedScale}) translate(${x}%, ${y}%)`;
        
        this.layer3Image.style.transform = transform;
    }
    
    // ============================================
    // PAN CONTROLS
    // ============================================
    
    pan(direction) {
        const increment = 10; // 10% of viewport per action
        const maxPan = this.getMaxPan();
        
        let { x, y } = this.state.panPosition;
        
        switch(direction) {
            case 'up':
                if (y >= maxPan.y) {
                    this.announce('Top limit reached.');
                    return;
                }
                y = Math.min(y + increment, maxPan.y);
                this.announce('Panned up.');
                break;
            case 'down':
                if (y <= -maxPan.y) {
                    this.announce('Bottom limit reached.');
                    return;
                }
                y = Math.max(y - increment, -maxPan.y);
                this.announce('Panned down.');
                break;
            case 'left':
                if (x >= maxPan.x) {
                    this.announce('Left limit reached.');
                    return;
                }
                x = Math.min(x + increment, maxPan.x);
                this.announce('Panned left.');
                break;
            case 'right':
                if (x <= -maxPan.x) {
                    this.announce('Right limit reached.');
                    return;
                }
                x = Math.max(x - increment, -maxPan.x);
                this.announce('Panned right.');
                break;
        }
        
        this.state.panPosition = { x, y };
        this.updateZoomTransform();
        this.updatePanButtonStates();
    }
    
    getMaxPan() {
        // Calculate max pan based on zoom level
        // At 0% zoom (fit to screen), no panning allowed
        // At higher zoom, more panning allowed
        if (this.state.zoomLevel <= 0) {
            return { x: 0, y: 0 };
        }
        
        // Max pan increases with zoom level
        const maxPan = Math.min(this.state.zoomLevel * 0.5, 150);
        return { x: maxPan, y: maxPan };
    }
    
    updatePanButtonStates() {
        const maxPan = this.getMaxPan();
        const { x, y } = this.state.panPosition;
        
        this.layer3Buttons.forEach(button => {
            const action = button.dataset.action;
            let disabled = false;
            
            switch(action) {
                case 'pan-up':
                    disabled = y >= maxPan.y;
                    break;
                case 'pan-down':
                    disabled = y <= -maxPan.y;
                    break;
                case 'pan-left':
                    disabled = x >= maxPan.x;
                    break;
                case 'pan-right':
                    disabled = x <= -maxPan.x;
                    break;
            }
            
            if (['pan-up', 'pan-down', 'pan-left', 'pan-right'].includes(action)) {
                button.disabled = disabled;
                if (disabled) {
                    button.setAttribute('aria-disabled', 'true');
                } else {
                    button.removeAttribute('aria-disabled');
                }
            }
        });
    }
    
    // ============================================
    // HOLD-TO-REPEAT FUNCTIONALITY
    // ============================================
    
    startHoldToRepeat(action) {
        // Initial delay before repeat starts
        this.state.holdTimer = setTimeout(() => {
            // Start repeating
            this.state.holdInterval = setInterval(() => {
                action();
            }, 150); // Repeat every 150ms
        }, 400); // Wait 400ms before starting repeat
    }
    
    stopHoldToRepeat() {
        if (this.state.holdTimer) {
            clearTimeout(this.state.holdTimer);
            this.state.holdTimer = null;
        }
        if (this.state.holdInterval) {
            clearInterval(this.state.holdInterval);
            this.state.holdInterval = null;
        }
    }
    
    // ============================================
    // FOCUS TRAP UTILITY
    // ============================================
    
    handleFocusTrap(e, buttons) {
        const enabledButtons = Array.from(buttons).filter(btn => !btn.disabled);
        
        if (enabledButtons.length === 0) return;
        
        const currentIndex = enabledButtons.indexOf(document.activeElement);
        
        if (e.key === 'Tab') {
            e.preventDefault();
            
            if (e.shiftKey) {
                // Shift+Tab - go to previous
                const prevIndex = currentIndex <= 0 ? enabledButtons.length - 1 : currentIndex - 1;
                enabledButtons[prevIndex].focus();
                this.announceFocusedButton(enabledButtons[prevIndex]);
            } else {
                // Tab - go to next
                const nextIndex = currentIndex >= enabledButtons.length - 1 ? 0 : currentIndex + 1;
                enabledButtons[nextIndex].focus();
                this.announceFocusedButton(enabledButtons[nextIndex]);
            }
        }
    }
    
    announceFocusedButton(button) {
        let label = button.textContent.trim();
        
        // Add disabled state to announcement if applicable
        if (button.disabled) {
            label += '. Disabled.';
        }
        
        this.announce(label);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CarouselController;
}
