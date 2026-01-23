import { Injectable, NgZone } from '@angular/core';
import {
  webglConfig,
  getColorScheme,
  getDefaultColorScheme,
  getThemeNames,
  getRandomColorScheme
} from '../config/webgl.config';

/**
 * WebGL Gradient Service
 * Based on the Stripe WebGL gradient implementation
 * @see https://gist.github.com/jordienr/64bcf75f8b08641f205bd6a1a0d4ce1d
 */
@Injectable({
  providedIn: 'root'
})
export class WebGLGradientService {
  private gradients: Map<string, GradientInstance> = new Map();

  constructor(private ngZone: NgZone) {}

  /**
   * Get theme names for all color schemes
   */
  getThemeNames(): string[] {
    return getThemeNames();
  }

  /**
   * Get a specific color scheme by theme name
   */
  getColorScheme(themeName: string): number[][] {
    return getColorScheme(themeName) || getDefaultColorScheme();
  }

  /**
   * Get color scheme by index (for backward compatibility)
   */
  getColorSchemeByIndex(index: number): number[][] {
    const themeNames = this.getThemeNames();
    if (index >= 0 && index < themeNames.length) {
      const scheme = getColorScheme(themeNames[index]);
      return scheme || getDefaultColorScheme();
    }
    return getDefaultColorScheme();
  }

  /**
   * Get a random color scheme
   */
  getRandomColorScheme(): number[][] {
    return getRandomColorScheme();
  }

  /**
   * Generate random colors (kept for backward compatibility)
   */
  private generateRandomColors(count: number = 4): number[][] {
    const colors: number[][] = [];
    for (let i = 0; i < count; i++) {
      colors.push([
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
      ]);
    }
    return colors;
  }

  /**
   * Apply a WebGL gradient to a container element
   */
  applyGradient(
    container: HTMLElement,
    options: {
      colors?: number[][];
      themeName?: string;
      speed?: number;
      amplitude?: number;
      darkerTop?: boolean;
      parallax?: boolean;
      parallaxIntensity?: number;
      onColorsUpdate?: (colors: number[][]) => void;
      onBrightnessUpdate?: (angle: number, brightness: number) => void;
    } = {}
  ): void {
    const existingId = container.getAttribute('data-gradient-id');
    if (existingId && this.gradients.has(existingId)) {
      return;
    }

    // Generate a unique ID for this gradient instance
    const id = existingId || `gradient-${Math.random().toString(36).substring(2, 9)}`;
    container.setAttribute('data-gradient-id', id);

    // Run outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      try {
        // Check if WebGL is supported with Safari-compatible context options
        const testCanvas = document.createElement('canvas');
        const contextOptions = {
          alpha: true,
          premultipliedAlpha: false,
          antialias: true,
          depth: false,
          stencil: false,
          preserveDrawingBuffer: false
        };
        const testContext = testCanvas.getContext('webgl', contextOptions) || 
                           testCanvas.getContext('experimental-webgl', contextOptions);

        if (!testContext) {
          // WebGL not supported, apply CSS fallback
          this.applyCssFallback(container, options.colors || getDefaultColorScheme());
          return;
        }

        // Determine which colors to use:
        // 1. Explicitly provided colors take precedence
        // 2. If a theme name is provided, use that scheme
        // 3. Otherwise use random or default based on config
        let colors: number[][];

        if (options.colors) {
          // Use explicitly provided colors
          colors = options.colors;
        } else if (options.themeName) {
          // Use the specified theme
          colors = this.getColorScheme(options.themeName);
        } else {
          // Use default theme
          colors = getDefaultColorScheme();
        }

        // Initialize gradient with configuration
        const gradient = new GradientInstance({
          element: container,
          colors: colors,
          speed: options.speed !== undefined ? options.speed : webglConfig.background.speed,
          amplitude: options.amplitude !== undefined ? options.amplitude : webglConfig.background.amplitude,
          darkerTop: options.darkerTop !== undefined ? options.darkerTop : webglConfig.background.darkerTop,
          parallax: options.parallax !== undefined ? options.parallax : webglConfig.background.parallax,
          parallaxIntensity: options.parallaxIntensity !== undefined ? options.parallaxIntensity : webglConfig.background.parallaxIntensity,
          onColorsUpdate: options.onColorsUpdate,
          onBrightnessUpdate: options.onBrightnessUpdate
        });

        // Store reference to the gradient instance
        this.gradients.set(id, gradient);
      } catch (error) {
        console.error('Error initializing WebGL gradient:', error);
        // Apply CSS fallback in case of errors
        this.applyCssFallback(container, options.colors || getDefaultColorScheme());
      }
    });
  }

  /**
   * Apply a CSS fallback gradient for browsers without WebGL support
   */
  private applyCssFallback(container: HTMLElement, colors: number[][]): void {
    // Convert RGB arrays to CSS colors
    const cssColors = colors.map(rgb =>
      `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    );

    // Apply a simple linear gradient as fallback
    container.style.background = `linear-gradient(135deg, ${cssColors.join(', ')})`;

    // Add some subtle animation with CSS
    const keyframes = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;

    // Add keyframes to document if not already present
    if (!document.getElementById('gradient-keyframes')) {
      const style = document.createElement('style');
      style.id = 'gradient-keyframes';
      style.innerHTML = keyframes;
      document.head.appendChild(style);
    }

    // Apply animation
    container.style.backgroundSize = '400% 400%';
    container.style.animation = 'gradientShift 15s ease infinite';
  }

  /**
   * Remove gradient and clean up resources
   */
  removeGradient(container: HTMLElement): void {
    const id = container.getAttribute('data-gradient-id');
    if (id && this.gradients.has(id)) {
      this.gradients.get(id)?.destroy();
      this.gradients.delete(id);
    }
  }

  /**
   * Transition existing gradient to new colors smoothly
   */
  transitionGradientColors(container: HTMLElement, newColors: number[][]): void {
    const id = container.getAttribute('data-gradient-id');
    if (id && this.gradients.has(id)) {
      const gradient = this.gradients.get(id);
      if (gradient) {
        gradient.transitionToColors(newColors);
      }
    }
  }

  /**
   * Remove all gradients and clean up
   */
  destroyAll(): void {
    this.gradients.forEach(gradient => gradient.destroy());
    this.gradients.clear();
  }
}

/**
 * The core gradient implementation class, based on the Stripe WebGL gradient
 */
class GradientInstance {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private width!: number;
  private height!: number;
  private dpr: number = window.devicePixelRatio || 1;
  private uniforms: any = {};
  private program!: WebGLProgram;
  private amplitudeValue: number;
  private playing: boolean = true;
  private config: any;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private frame: number = 0;
  private darkerTop: boolean = false;
  private parallax: boolean = false;
  private parallaxIntensity: number = 0.5;
  private scrollY: number = 0;
  private scrollListenerAdded: boolean = false;
  // Color interpolation properties
  private currentColors: number[][] = [];
  private targetColors: number[][] = [];
  private transitionStartTime: number = 0;
  private isTransitioning: boolean = false;
  private transitionDuration: number = 500; // 0.5s in milliseconds
  private onColorsUpdate?: (colors: number[][]) => void;
  private onBrightnessUpdate?: (angle: number, brightness: number) => void;
  private lastEmittedColors: number[][] = [];
  private colorEmitThrottle: number = 0;
  private resizeObserver?: ResizeObserver;
  private readonly onWindowResize = () => this.resize();
  private readonly onWindowScroll = () => this.handleScroll();

  constructor(options: {
    element: HTMLElement;
    colors: number[][];
    speed: number;
    amplitude: number;
    darkerTop: boolean;
    parallax: boolean;
    parallaxIntensity: number;
    onColorsUpdate?: (colors: number[][]) => void;
    onBrightnessUpdate?: (angle: number, brightness: number) => void;
  }) {
    this.config = {
      ...options,
      colors: options.colors.map(color => color.map(c => c / 255)),
      playing: true,
    };

    this.amplitudeValue = this.config.amplitude;
    this.darkerTop = this.config.darkerTop;
    this.parallax = this.config.parallax;
    this.parallaxIntensity = this.config.parallaxIntensity;
    this.onColorsUpdate = options.onColorsUpdate;
    this.onBrightnessUpdate = options.onBrightnessUpdate;

    // Initialize color interpolation
    this.currentColors = JSON.parse(JSON.stringify(this.config.colors));
    this.targetColors = JSON.parse(JSON.stringify(this.config.colors));
    this.lastEmittedColors = JSON.parse(JSON.stringify(this.config.colors));

    // Setup canvas and context
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1';
    
    // Append canvas to DOM FIRST (Safari needs this for proper sizing)
    options.element.appendChild(this.canvas);
    
    // NOW set canvas dimensions after it's in the DOM (critical for Safari)
    const displayWidth = options.element.offsetWidth || options.element.clientWidth || window.innerWidth;
    const displayHeight = options.element.offsetHeight || options.element.clientHeight || window.innerHeight;

    // Store CSS dimensions
    this.width = displayWidth;
    this.height = displayHeight;

    // Set actual canvas buffer size accounting for devicePixelRatio
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(displayWidth * dpr);
    this.canvas.height = Math.floor(displayHeight * dpr);

    // Try to get WebGL context with Safari-compatible options
    const contextOptions = {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false
    };
    
    this.gl = (this.canvas.getContext('webgl', contextOptions) || 
               this.canvas.getContext('experimental-webgl', contextOptions)) as WebGLRenderingContext;

    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }

    // Enable alpha blending for Safari compatibility
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    // Clear to transparent black
    this.gl.clearColor(0, 0, 0, 0);

    // Setup scroll listener for parallax if enabled
    if (this.parallax) {
      this.setupScrollListener();
    }

    // Setup ResizeObserver for robust resize detection
    this.setupResizeObserver();

    // Setup shaders and WebGL program
    this.initializeShaders();
    this.resize();
    this.setColors();
    
    // Safari-specific: Force initial render before starting animation
    // This ensures the canvas is properly initialized
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Start animation
    this.animate();

    // Add resize listener
    window.addEventListener('resize', this.onWindowResize);
    
    // Safari-specific: Trigger a resize after a short delay to ensure proper initialization
    setTimeout(() => {
      if (this.canvas && this.gl && this.playing) {
        this.resize();
      }
    }, 100);
  }

  /**
   * Setup scroll event listener for parallax effect
   */
  private setupScrollListener(): void {
    if (!this.scrollListenerAdded) {
      // Use passive event listener for better performance
      window.addEventListener('scroll', this.onWindowScroll, { passive: true });
      this.scrollListenerAdded = true;

      // Initial scroll position
      this.scrollY = window.scrollY || window.pageYOffset;
    }
  }

  /**
   * Setup ResizeObserver for container-based resize detection
   * More reliable than window resize events for responsive layouts
   */
  private setupResizeObserver(): void {
    // Check for browser support (should be available in all modern browsers)
    if (typeof ResizeObserver === 'undefined') {
      console.warn('ResizeObserver not supported, falling back to window resize only');
      return;
    }

    this.resizeObserver = new ResizeObserver(entries => {
      // ResizeObserver callbacks are already debounced by the browser
      for (const entry of entries) {
        // Only respond to our canvas parent
        if (entry.target === this.canvas.parentElement) {
          this.resize();
        }
      }
    });

    // Observe the canvas parent element (not the canvas itself)
    const parent = this.canvas.parentElement;
    if (parent) {
      this.resizeObserver.observe(parent);
    }
  }

  /**
   * Handle scroll events for parallax effect
   */
  private handleScroll(): void {
    // Update scroll position
    this.scrollY = window.scrollY || window.pageYOffset;
  }

  private initializeShaders(): void {
    // Vertex shader program
    const vertexShaderSource = `
      precision highp float;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = 0.5 * (position + 1.0);
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader program for smooth gradient blending
    const fragmentShaderSource = `
      precision highp float;
      uniform vec3 u_colors[4];
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_amplitude;
      uniform float u_darker_top;
      uniform float u_scroll_offset;
      uniform float u_parallax_enabled;
      varying vec2 vUv;

      // Noise functions from Stripe implementation
      vec4 permute(vec4 x) {
        return mod(((x*34.0)+1.0)*x, 289.0);
      }

      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        // Permutations
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        // Gradients
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      // High-quality dithering to eliminate color banding
      // Uses triangular probability distribution for smooth dither
      float dither(vec2 fragCoord) {
        // Generate pseudo-random value from screen position
        float noise = fract(sin(dot(fragCoord, vec2(12.9898, 78.233))) * 43758.5453);
        // Convert to triangular distribution (-1 to 1) for better visual quality
        return (noise * 2.0 - 1.0) / 255.0;
      }

      void main() {
        // Normalized pixel coordinates
        vec2 uv = vUv;

        // Apply parallax effect if enabled
        if (u_parallax_enabled > 0.5) {
          uv.y += u_scroll_offset;
        }

        // Time-based animation with subtle variation
        float time = u_time * 0.22; // Increased from 0.15 for more noticeable movement

        // Add subtle pulsing effect for more "alive" feeling
        float pulse = sin(u_time * 0.08) * 0.05 + 1.0; // Very subtle breathing effect

        // Create multiple noise layers with varied speeds for organic, flowing movement
        float noise1 = snoise(vec3(uv * 0.75, time * 0.35)) * u_amplitude * 1.6 * pulse; // Larger primary shapes
        float noise2 = snoise(vec3(uv * 1.4, time * 0.5)) * u_amplitude * 0.8; // Medium details
        float noise3 = snoise(vec3(uv * 2.8, time * 0.65)) * u_amplitude * 0.35; // Smaller details
        float noise4 = snoise(vec3(uv * 4.5, time * 0.8)) * u_amplitude * 0.15; // Fine texture layer

        // Combined noise with all layers for richer, more dynamic appearance
        float noiseValue = noise1 + noise2 + noise3 + noise4;

        // Map noise to color index (0-1 range)
        float colorPosition = (noiseValue + 1.0) * 0.5;

        // Blend between colors based on noise value
        vec3 color = u_colors[0];

        // Smooth color transitions
        for (int i = 1; i < 4; i++) {
          float blend = smoothstep(float(i-1) / 3.0, float(i) / 3.0, colorPosition);
          color = mix(color, u_colors[i], blend);
        }

        // Apply darker top if enabled
        if (u_darker_top > 0.5) {
          float darkness = 1.0 - uv.y * 0.5;
          color *= darkness;
        }

        // Increase brightness by 10%
        color *= 1.15;

        // Apply dithering to eliminate color banding
        // Convert UV to screen coordinates for dither pattern
        vec2 screenCoord = vUv * u_resolution;
        float ditherValue = dither(screenCoord);
        color += vec3(ditherValue);

        // Output final color
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create and compile shaders
    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (!vertexShader) throw new Error('Could not create vertex shader');

    this.gl.shaderSource(vertexShader, vertexShaderSource);
    this.gl.compileShader(vertexShader);

    if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation error:', this.gl.getShaderInfoLog(vertexShader));
      this.gl.deleteShader(vertexShader);
      return;
    }

    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!fragmentShader) throw new Error('Could not create fragment shader');

    this.gl.shaderSource(fragmentShader, fragmentShaderSource);
    this.gl.compileShader(fragmentShader);

    if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation error:', this.gl.getShaderInfoLog(fragmentShader));
      this.gl.deleteShader(fragmentShader);
      return;
    }

    // Create program and link shaders
    this.program = this.gl.createProgram() as WebGLProgram;
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(this.program));
      return;
    }

    // Create plane geometry (full screen quad)
    const vertices = new Float32Array([
      -1.0, -1.0,  // bottom left
       1.0, -1.0,  // bottom right
      -1.0,  1.0,  // top left
       1.0,  1.0,  // top right
    ]);

    // Create buffer for vertices
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    // Setup position attribute
    const positionLocation = this.gl.getAttribLocation(this.program, 'position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Setup uniforms
    this.uniforms = {
      u_time: this.gl.getUniformLocation(this.program, 'u_time'),
      u_resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
      u_amplitude: this.gl.getUniformLocation(this.program, 'u_amplitude'),
      u_darker_top: this.gl.getUniformLocation(this.program, 'u_darker_top'),
      u_scroll_offset: this.gl.getUniformLocation(this.program, 'u_scroll_offset'),
      u_parallax_enabled: this.gl.getUniformLocation(this.program, 'u_parallax_enabled')
    };

    // Setup uniform locations for colors
    this.uniforms.u_colors = [];
    for (let i = 0; i < 4; i++) {
      this.uniforms.u_colors[i] = this.gl.getUniformLocation(this.program, `u_colors[${i}]`);
    }
  }

  private setColors(): void {
    this.gl.useProgram(this.program);

    // Set color uniforms using current interpolated colors
    for (let i = 0; i < 4; i++) {
      const color = i < this.currentColors.length ? this.currentColors[i] : [0, 0, 0];
      this.gl.uniform3fv(this.uniforms.u_colors[i], new Float32Array(color));
    }
  }

  /**
   * Smoothly transition to new colors
   */
  transitionToColors(newColors: number[][]): void {
    // Convert to normalized colors (0-1 range)
    this.targetColors = newColors.map(color => color.map(c => c / 255));
    // Use requestAnimationFrame time format (DOMHighResTimeStamp)
    this.transitionStartTime = performance.now();
    this.isTransitioning = true;
  }

  /**
   * Update color interpolation
   */
  private updateColorTransition(currentTime: number): void {
    if (!this.isTransitioning) return;

    const elapsed = currentTime - this.transitionStartTime;
    const progress = Math.min(elapsed / this.transitionDuration, 1.0);

    // Use ease-in-out easing function
    const easedProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Interpolate each color
    for (let i = 0; i < 4; i++) {
      const startColor = this.currentColors[i] || [0, 0, 0];
      const endColor = this.targetColors[i] || [0, 0, 0];

      this.currentColors[i] = [
        startColor[0] + (endColor[0] - startColor[0]) * easedProgress,
        startColor[1] + (endColor[1] - startColor[1]) * easedProgress,
        startColor[2] + (endColor[2] - startColor[2]) * easedProgress
      ];
    }

    // Update colors in shader
    this.setColors();

    // Check if transition is complete
    if (progress >= 1.0) {
      this.isTransitioning = false;
      this.currentColors = JSON.parse(JSON.stringify(this.targetColors));
    }
  }

  /**
   * Emit current colors to callback at regular intervals
   * Colors are emitted continuously during animation for dynamic reflections
   */
  private emitColorsIfChanged(currentTime: number): void {
    // Throttle emissions to avoid excessive updates
    if (currentTime - this.colorEmitThrottle < webglConfig.reflection.updateThrottle) {
      return;
    }

    // Convert normalized colors (0-1) back to RGB (0-255) for emission
    if (this.onColorsUpdate) {
      const rgbColors = this.currentColors.map(color => 
        color.map(c => Math.round(c * 255))
      );
      this.onColorsUpdate(rgbColors);
    }

    // Calculate and emit brightness distribution for dynamic reflection angle
    if (this.onBrightnessUpdate) {
      const { angle, brightness } = this.calculateBrightnessDistribution(currentTime);
      this.onBrightnessUpdate(angle, brightness);
    }
    
    this.lastEmittedColors = this.currentColors.map(color => color.slice());
    this.colorEmitThrottle = currentTime;
  }

  /**
   * Calculate brightness distribution to determine reflection direction
   * Simulates the movement of bright areas in the noise-animated gradient
   * @param time Current time in milliseconds from performance.now()
   */
  private calculateBrightnessDistribution(time: number): { angle: number; brightness: number } {
    // Calculate base luminance for the color scheme
    let totalLuminance = 0;
    for (let i = 0; i < 4; i++) {
      const color = this.currentColors[i] || [0, 0, 0];
      const luminance = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
      totalLuminance += luminance;
    }
    const baseBrightness = totalLuminance / 4;

    // Simulate noise movement using time-based animation
    // This mirrors the shader's noise animation pattern
    const timeInSeconds = time * 0.001 * this.config.speed;
    
    // Create organic circular motion with multiple frequencies (like noise layers)
    // These frequencies match the noise layers in the fragment shader
    // Values tuned to create smooth, natural movement
    const slowWave = Math.sin(timeInSeconds * 0.22) * 0.5;     // Primary slow movement
    const mediumWave = Math.cos(timeInSeconds * 0.35) * 0.3;   // Medium variation
    const fastWave = Math.sin(timeInSeconds * 0.5) * 0.2;      // Fast detail
    
    // Combine waves to create natural, flowing movement
    const x = slowWave + mediumWave * 0.5;
    const y = mediumWave + fastWave * 0.5;
    
    // Add parallax influence if enabled (bright areas shift with scroll)
    let scrollInfluence = 0;
    if (this.parallax && this.scrollY !== undefined) {
      const viewportHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const maxScroll = documentHeight - viewportHeight;
      const scrollProgress = maxScroll > 0 ? this.scrollY / maxScroll : 0;
      scrollInfluence = scrollProgress * this.parallaxIntensity * 0.3; // Subtle scroll influence
    }
    
    // Calculate angle from movement vector (atan2 returns radians)
    let angle = Math.atan2(y + scrollInfluence, x) * (180 / Math.PI);
    
    // Add base rotation so the default rest position varies with color scheme brightness
    // Brighter schemes tend toward bottom-right (lighter feel)
    // Base rotation: 45° (bottom-right), range: 90° variation
    const baseRotation = 45 + (baseBrightness * 90);
    angle = (angle + baseRotation) % 360;
    
    // Ensure angle is positive
    if (angle < 0) angle += 360;

    // Animate brightness using pulse effect (matches shader's breathing effect)
    // This simulates the expansion and contraction of bright areas in the gradient
    const pulse = Math.sin(timeInSeconds * 0.08) * 0.05 + 1.0; // Subtle breathing (0.95 - 1.05)
    
    // Add noise-based brightness variation (simulates bright/dark patches moving)
    const brightnessPulse = Math.sin(timeInSeconds * 0.3) * 0.15; // More pronounced variation
    const brightnessDrift = Math.cos(timeInSeconds * 0.18) * 0.1; // Slower drift
    
    // Combine base brightness with animated variations
    // Keep within reasonable bounds (0.2 - 0.8)
    let animatedBrightness = baseBrightness * pulse + brightnessPulse + brightnessDrift;
    animatedBrightness = Math.max(0.2, Math.min(0.8, animatedBrightness));

    return { angle, brightness: animatedBrightness };
  }

  private resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    // Get CSS display dimensions with fallbacks for Safari
    const displayWidth = parent.offsetWidth || parent.clientWidth || window.innerWidth;
    const displayHeight = parent.offsetHeight || parent.clientHeight || window.innerHeight;
    
    // Safari fix: Don't resize if dimensions are zero or invalid
    if (displayWidth <= 0 || displayHeight <= 0) {
      return;
    }

    // Account for high-DPI displays (Retina, 4K, etc.)
    const dpr = window.devicePixelRatio || 1;
    const dprChanged = dpr !== this.dpr;

    // Avoid resize churn (1px jitter can cause unbounded GPU reallocations).
    if (!dprChanged && this.width && this.height) {
      const widthDiff = Math.abs(displayWidth - this.width);
      const heightDiff = Math.abs(displayHeight - this.height);
      if (widthDiff < 2 && heightDiff < 2) {
        return;
      }
    }
    this.dpr = dpr;

    const width = Math.floor(displayWidth * dpr);
    const height = Math.floor(displayHeight * dpr);

    // Update internal dimensions (CSS pixels for reference)
    this.width = displayWidth;
    this.height = displayHeight;

    // Set canvas buffer size to physical pixels (prevents blur)
    if (this.canvas.width !== width) {
      this.canvas.width = width;
    }
    if (this.canvas.height !== height) {
      this.canvas.height = height;
    }

    // Update WebGL viewport to match physical pixel dimensions
    this.gl.viewport(0, 0, width, height);

    this.gl.useProgram(this.program);
    this.gl.uniform2f(this.uniforms.u_resolution, width, height);
  }

  private shouldSkipFrame(): boolean {
    return !document.body.contains(this.canvas) ||
           !this.playing;
           // Removed frame skipping for smoother, more fluid animation
  }

  private render(time: number): void {
    if (!this.playing) return;

    // Update color transition if in progress (time is in milliseconds from performance.now())
    if (this.isTransitioning) {
      this.updateColorTransition(time);
    }

    // Emit colors and brightness distribution to callbacks (throttled)
    this.emitColorsIfChanged(time);

    // Clear canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Use program and set uniforms
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.uniforms.u_time, time * 0.001 * this.config.speed);
    this.gl.uniform1f(this.uniforms.u_amplitude, this.amplitudeValue);
    this.gl.uniform1f(this.uniforms.u_darker_top, this.darkerTop ? 1.0 : 0.0);

    // Apply parallax if enabled
    if (this.parallax) {
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
      const maxScroll = documentHeight - viewportHeight;
      const scrollProgress = maxScroll > 0 ? this.scrollY / maxScroll : 0;

      // Apply parallax effect - smaller value for slower scroll
      this.gl.uniform1f(this.uniforms.u_scroll_offset, scrollProgress * this.parallaxIntensity * -0.2);
      this.gl.uniform1f(this.uniforms.u_parallax_enabled, 1.0);
    } else {
      this.gl.uniform1f(this.uniforms.u_scroll_offset, 0.0);
      this.gl.uniform1f(this.uniforms.u_parallax_enabled, 0.0);
    }

    // Draw the quad
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  private animate(): void {
    // Start animation loop
    const animateFrame = (time: number) => {
      if (!this.playing) {
        return;
      }
      // Increment frame counter (used for skipping frames)
      this.frame += 1;

      // Skip rendering if needed
      if (!this.shouldSkipFrame()) {
        this.render(time);
      }

      this.animationFrameId = requestAnimationFrame(animateFrame);
    };

    this.animationFrameId = requestAnimationFrame(animateFrame);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.playing = false;
    // Stop animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Disconnect ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);

    if (this.scrollListenerAdded) {
      window.removeEventListener('scroll', this.onWindowScroll);
      this.scrollListenerAdded = false;
    }

    // Remove the canvas from DOM
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
