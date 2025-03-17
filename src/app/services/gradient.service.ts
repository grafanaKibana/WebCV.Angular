import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GradientService {
  // Base color (dark green)
  private baseColorHex = '#123524';
  
  // Default animation speed (0.5 is moderate, 1.0 is fast, 0.1 is slow)
  private defaultSpeed = 0.5;
  
  // Parallax effect intensity (0 = none, 1 = full movement)
  private parallaxIntensity = 0.6; // Increased for more noticeable effect
  
  // Track scroll position
  private scrollX = 0;
  private scrollY = 0;
  private previousScrollY = 0;
  private scrollListenerAdded = false;
  
  // Colors for gradients - complementary to dark green (#123524)
  private colors = [
    // Primary green family (monochromatic variations of base color #123524)
    'hsla(140,60%,15%,0.9)',   // very dark green
    'hsla(140,55%,25%,0.85)',  // dark forest green
    'hsla(140,50%,35%,0.8)',   // medium green
    'hsla(140,45%,45%,0.75)',  // lighter green
    
    // Analogous colors (adjacent on color wheel to green)
    'hsla(120,60%,30%,0.8)',   // true green
    'hsla(160,65%,35%,0.75)',  // blue-green/teal
    
    // Complementary colors (opposite on color wheel from green)
    'hsla(320,70%,35%,0.7)',   // deep magenta
    'hsla(320,65%,45%,0.65)',  // medium magenta
    
    // Split-complementary colors
    'hsla(290,60%,40%,0.7)',   // purple
    'hsla(350,65%,40%,0.65)',  // red-magenta
    
    // Clean accent colors (avoiding muddy combinations)
    'hsla(200,75%,40%,0.65)',  // clear blue
    'hsla(220,70%,45%,0.65)',  // royal blue
    
    // Vibrant accents with high saturation
    'hsla(180,80%,30%,0.7)',   // deep cyan
    'hsla(190,75%,45%,0.65)',  // turquoise
    
    // Cool tones that complement without muddiness
    'hsla(210,70%,50%,0.6)',   // sky blue
    'hsla(240,65%,55%,0.55)',  // periwinkle blue
    
    // Pure hues with controlled saturation
    'hsla(140,30%,20%,0.8)',   // muted dark green
    'hsla(140,40%,60%,0.5)',   // soft mint green
    'hsla(170,60%,40%,0.7)',   // emerald
    'hsla(190,65%,65%,0.6)'    // aqua
  ];

  // Store gradient information for animation
  private gradientPoints: Array<{
    // Display position (0-100 range, wrapped)
    xPos: number;
    yPos: number;
    // Motion vectors
    xVelocity: number;
    yVelocity: number;
    // Appearance
    color: string;
    size: number;
    // Animation states
    trueX: number; // Continuous position for animation
    trueY: number; // Continuous position for animation
    // Parallax factor (different for each blob for layered effect)
    parallaxFactor: number;
    // Size pulsing
    baseBlobSize: number; // Original blob size
    pulsePhase: number;   // Position in pulse cycle (0-2π)
    pulseSpeed: number;   // Speed of pulsing
  }> = [];

  private animationFrameId: number | null = null;
  private activeElements: Map<HTMLElement, {
    baseColor: string;
    numGradients: number;
    speed: number;
    parallax: boolean;
  }> = new Map();

  constructor() {
    // Initialize scroll tracking
    this.setupScrollListener();
  }
  
  /**
   * Set up scroll event listener for parallax effect
   */
  private setupScrollListener(): void {
    if (!this.scrollListenerAdded) {
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
      this.scrollListenerAdded = true;
      
      // Initial values
      this.scrollX = window.scrollX || window.pageXOffset;
      this.scrollY = window.scrollY || window.pageYOffset;
      this.previousScrollY = this.scrollY;
      
      console.log('Scroll listener initialized');
    }
  }
  
  /**
   * Handle scroll events for parallax effect
   */
  private handleScroll(): void {
    // Update scroll position
    this.previousScrollY = this.scrollY;
    this.scrollX = window.scrollX || window.pageXOffset;
    this.scrollY = window.scrollY || window.pageYOffset;
  }

  /**
   * Generates a random mesh gradient value for background-image
   * @param baseColor Optional base background color (default: #123524)
   * @param numGradients Number of gradient layers to generate (default: 7)
   * @returns CSS string with the generated gradient
   */
  generateMeshGradient(baseColor: string = this.baseColorHex, numGradients: number = 7): string {
    // Build the background-image value for multiple radial gradients
    let gradientValue = '';
    
    // Generate random gradients
    for (let i = 0; i < numGradients; i++) {
      // Random position
      const xPos = this.randomInt(10, 90);
      const yPos = this.randomInt(10, 90);
      
      // Random color from our palette
      const colorIndex = this.randomInt(0, this.colors.length - 1);
      const color = this.colors[colorIndex];
      
      // Random size between 40-60% for more variety
      const size = this.randomInt(40, 60);
      
      gradientValue += `radial-gradient(at ${xPos}% ${yPos}%, ${color} 0px, transparent ${size}%)`;
      
      // Add comma if not the last gradient
      if (i < numGradients - 1) {
        gradientValue += ', ';
      }
    }
    
    return gradientValue;
  }

  /**
   * Initialize gradient points for animation
   * @param numGradients Number of gradient points to create
   * @param speed Animation speed multiplier (higher = faster)
   */
  private initializeGradientPoints(numGradients: number, speed: number = this.defaultSpeed): void {
    this.gradientPoints = [];
    
    for (let i = 0; i < numGradients; i++) {
      // Random position - keep away from edges initially
      const xPos = this.randomInt(20, 80);
      const yPos = this.randomInt(20, 80);
      
      // Random color from our palette
      const colorIndex = this.randomInt(0, this.colors.length - 1);
      const color = this.colors[colorIndex];
      
      // Random velocity - using the speed parameter to control overall animation speed
      // Use a minimum velocity to prevent extremely slow-moving blobs
      const minVelocity = speed * 0.1;
      let xVelocity = (Math.random() - 0.5) * speed;
      let yVelocity = (Math.random() - 0.5) * speed;
      
      // Ensure minimum velocity
      if (Math.abs(xVelocity) < minVelocity) {
        xVelocity = xVelocity >= 0 ? minVelocity : -minVelocity;
      }
      if (Math.abs(yVelocity) < minVelocity) {
        yVelocity = yVelocity >= 0 ? minVelocity : -minVelocity;
      }
      
      // Wider range of sizes for more variety (35-70% instead of 40-60%)
      // Larger blobs for primary colors, smaller for accents
      let size;
      if (colorIndex < 3) {
        // Primary greens get larger sizes
        size = this.randomInt(50, 70);
      } else if (colorIndex >= 16) {
        // Monochromatic variations get medium-large sizes
        size = this.randomInt(45, 65);
      } else {
        // Accent colors get smaller sizes
        size = this.randomInt(35, 55);
      }
      
      // Random parallax factor (0.2 to 1.0) for layered effect
      const parallaxFactor = 0.2 + Math.random() * 0.8;
      
      // Size pulsing
      const baseBlobSize = size;
      const pulsePhase = Math.random() * Math.PI * 2;
      const pulseSpeed = 0.5 + Math.random() * 1.5;
      
      this.gradientPoints.push({
        xPos,
        yPos,
        xVelocity,
        yVelocity,
        color,
        size,
        trueX: xPos,
        trueY: yPos,
        parallaxFactor,
        baseBlobSize,
        pulsePhase,
        pulseSpeed
      });
    }
  }

  /**
   * Update gradient positions for animation and parallax effect
   * @param applyParallax Whether to apply parallax scrolling effect
   */
  private updateGradientPositions(applyParallax: boolean = false): void {
    // Calculate the maximum parallax offset
    const maxParallaxOffset = 80; // Increased for more noticeable effect
    
    // Calculate document dimensions for scroll normalization
    const viewportHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    // Normalize scroll position (0 to 1)
    const scrollProgress = Math.min(this.scrollY / (documentHeight - viewportHeight), 1);
    
    // Update each gradient point
    for (const point of this.gradientPoints) {
      // Update continuous position for animation
      point.trueX += point.xVelocity;
      point.trueY += point.yVelocity;
      
      // Update pulsing effect
      point.pulsePhase += 0.01 * point.pulseSpeed;
      if (point.pulsePhase > Math.PI * 2) {
        point.pulsePhase -= Math.PI * 2; // Keep in 0-2π range
      }
      
      // Apply gentle sine wave to size (±15% variation)
      const pulseFactor = 1 + (Math.sin(point.pulsePhase) * 0.15);
      point.size = Math.round(point.baseBlobSize * pulseFactor);
      
      // Start with the true position
      let displayX = point.trueX;
      let displayY = point.trueY;
      
      // Apply parallax effect if enabled
      if (applyParallax) {
        // Calculate parallax offset for this specific point
        const parallaxY = scrollProgress * maxParallaxOffset * point.parallaxFactor * this.parallaxIntensity;
        const parallaxX = (this.scrollX / window.innerWidth) * maxParallaxOffset * point.parallaxFactor * this.parallaxIntensity;
        
        // Apply the parallax effect to display position
        displayX += parallaxX;
        displayY -= parallaxY; // Invert Y for natural feel
      }
      
      // Update the display position (wrapped for the 0-100 range)
      point.xPos = ((displayX % 100) + 100) % 100;
      point.yPos = ((displayY % 100) + 100) % 100;
    }
  }

  /**
   * Generate gradient value from current points using a tiling approach
   * This creates a seamless 3x3 grid of tiles, eliminating edge blinking
   */
  private generateGradientFromPoints(): string {
    const gradients: string[] = [];
    
    // Create a 3x3 grid of tiles for each gradient point
    for (const point of this.gradientPoints) {
      // Create the center tile
      gradients.push(this.createGradientString(point.xPos, point.yPos, point.color, point.size));
      
      // Create 8 surrounding tiles in a grid pattern
      // Top row
      gradients.push(this.createGradientString(point.xPos - 100, point.yPos - 100, point.color, point.size));
      gradients.push(this.createGradientString(point.xPos, point.yPos - 100, point.color, point.size));
      gradients.push(this.createGradientString(point.xPos + 100, point.yPos - 100, point.color, point.size));
      
      // Middle row (excluding center which was already added)
      gradients.push(this.createGradientString(point.xPos - 100, point.yPos, point.color, point.size));
      gradients.push(this.createGradientString(point.xPos + 100, point.yPos, point.color, point.size));
      
      // Bottom row
      gradients.push(this.createGradientString(point.xPos - 100, point.yPos + 100, point.color, point.size));
      gradients.push(this.createGradientString(point.xPos, point.yPos + 100, point.color, point.size));
      gradients.push(this.createGradientString(point.xPos + 100, point.yPos + 100, point.color, point.size));
    }
    
    // Join all gradients with commas
    return gradients.join(', ');
  }
  
  /**
   * Helper method to create a single gradient string
   */
  private createGradientString(x: number, y: number, color: string, size: number): string {
    return `radial-gradient(at ${x.toFixed(2)}% ${y.toFixed(2)}%, ${color} 0px, transparent ${size}%)`;
  }

  /**
   * Start the animation loop
   */
  private startAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      return; // Animation already running
    }
    
    const animate = () => {
      // Check if any elements use parallax
      const anyParallax = Array.from(this.activeElements.values()).some(config => config.parallax);
      
      // Update positions with parallax if any element uses it
      this.updateGradientPositions(anyParallax);
      
      // Update all active elements
      for (const [element, config] of this.activeElements.entries()) {
        element.style.backgroundImage = this.generateGradientFromPoints();
      }
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop the animation loop
   */
  private stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Clean up resources when service is destroyed
   */
  public cleanUp(): void {
    this.stopAnimationLoop();
    
    if (this.scrollListenerAdded) {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
      this.scrollListenerAdded = false;
    }
  }

  /**
   * Directly apply the mesh gradient to a DOM element
   * @param element DOM element to apply the gradient to
   * @param baseColor Optional base background color
   * @param numGradients Number of gradient layers
   * @param animate Whether to animate the gradient
   * @param speed Animation speed multiplier (higher = faster, default = 0.5)
   * @param parallax Whether to apply parallax effect on scroll
   */
  applyMeshGradient(
    element: HTMLElement, 
    baseColor: string = this.baseColorHex, 
    numGradients: number = 7,
    animate: boolean = false,
    speed: number = this.defaultSpeed,
    parallax: boolean = false
  ): void {
    // Calculate an optimal number of gradients based on performance
    // Too many gradients with tiling can cause performance issues
    const optimalGradients = Math.min(numGradients, 9); // Increased from 7 to 9 for more variety
    
    // Apply the styles directly
    element.style.backgroundColor = baseColor;
    element.style.backgroundPosition = 'center top';
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundAttachment = parallax ? 'fixed' : 'scroll';
    element.style.backgroundSize = 'cover';
    element.style.filter = 'blur(0.1px)';

    if (animate) {
      console.log(`Applying animated gradient with ${optimalGradients} gradients at speed ${speed}, parallax: ${parallax}`);
      
      // Store the element configuration
      this.activeElements.set(element, {
        baseColor,
        numGradients: optimalGradients,
        speed,
        parallax
      });
      
      // Initialize scroll listener if parallax is enabled
      if (parallax && !this.scrollListenerAdded) {
        this.setupScrollListener();
      }
      
      // Reinitialize gradient points each time to ensure fresh animation
      this.initializeGradientPoints(optimalGradients, speed);
      
      // Apply initial gradient
      element.style.backgroundImage = this.generateGradientFromPoints();
      
      // Start animation if not already running
      this.startAnimationLoop();
    } else {
      // Remove from active elements if it was there
      this.activeElements.delete(element);
      
      // Just apply a static gradient
      const gradientValue = this.generateMeshGradient(baseColor, numGradients);
      element.style.backgroundImage = gradientValue;
      
      // Stop animation if no active elements
      if (this.activeElements.size === 0) {
        this.stopAnimationLoop();
      }
    }
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
