import { Injectable, NgZone } from '@angular/core';

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

  // Define color schemes as a Map with theme names as keys
  // Curated to perfectly complement the dark theme and cyan accent colors
  private colorSchemesMap = new Map<string, number[][]>([
    ['Ocean Blue', [
      [19, 41, 75],     // Dark navy
      [34, 87, 126],    // Navy blue
      [56, 149, 211],   // Medium blue
      [88, 204, 237],   // Light blue
    ]],
    ['Neon Cyan', [
      [0, 20, 40],      // Deep midnight blue
      [0, 50, 80],      // Dark cyan-blue
      [0, 150, 200],    // Bright cyan
      [0, 187, 255],    // Neon cyan (matches accent)
    ]],
    ['Deep Purple', [
      [20, 15, 35],     // Deep violet-black
      [45, 30, 70],     // Rich purple
      [90, 60, 140],    // Vibrant purple
      [140, 100, 200],  // Light lavender
    ]],
    ['Amber Glow', [
      [40, 25, 15],     // Deep brown-orange
      [80, 50, 25],     // Dark amber
      [200, 120, 50],   // Warm amber
      [255, 180, 100],  // Golden amber
    ]],
    ['Emerald Forest', [
      [15, 30, 20],     // Deep forest green
      [25, 60, 40],     // Dark emerald
      [40, 120, 80],    // Rich emerald
      [80, 200, 140],   // Bright mint
    ]],
    ['Magenta Dream', [
      [35, 15, 30],     // Deep magenta-black
      [70, 25, 60],     // Dark magenta
      [150, 50, 130],   // Vibrant magenta
      [220, 100, 200],  // Soft pink-magenta
    ]],
    ['Slate Storm', [
      [20, 25, 30],     // Charcoal
      [40, 50, 60],     // Dark slate
      [80, 100, 120],   // Medium slate
      [140, 160, 180],  // Light slate blue
    ]],
    ['Sunset Horizon', [
      [30, 20, 35],     // Deep purple-pink
      [80, 40, 60],     // Dark rose
      [180, 80, 100],   // Coral pink
      [255, 150, 120],  // Peach
    ]]
  ]);

  private config = {
    defaultColors: this.colorSchemesMap.get('Neon Cyan')!, // Use Neon Cyan as default (matches accent)
    defaultSpeed: 0.5,      // Increased for more movement
    defaultAmplitude: 0.25, // Slightly increased for more visible variation
    parallaxIntensity: 0.5, // Default parallax intensity
  };

  constructor(private ngZone: NgZone) {}

  /**
   * Get theme names for all color schemes
   */
  getThemeNames(): string[] {
    return Array.from(this.colorSchemesMap.keys());
  }

  /**
   * Get a specific color scheme by theme name
   */
  getColorScheme(themeName: string): number[][] {
    return this.colorSchemesMap.get(themeName) || this.config.defaultColors;
  }

  /**
   * Get color scheme by index (for backward compatibility)
   */
  getColorSchemeByIndex(index: number): number[][] {
    const themeNames = this.getThemeNames();
    if (index >= 0 && index < themeNames.length) {
      return this.colorSchemesMap.get(themeNames[index])!;
    }
    return this.config.defaultColors;
  }

  /**
   * Get a random color scheme
   */
  getRandomColorScheme(): number[][] {
    const themeNames = this.getThemeNames();
    const randomIndex = Math.floor(Math.random() * themeNames.length);
    return this.colorSchemesMap.get(themeNames[randomIndex])!;
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
    } = {}
  ): void {
    // Generate a unique ID for this gradient instance
    const id = `gradient-${Math.random().toString(36).substring(2, 9)}`;
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
          this.applyCssFallback(container, options.colors || this.config.defaultColors);
          return;
        }

        // Determine which colors to use:
        // 1. Explicitly provided colors take precedence
        // 2. If a theme name is provided, use that scheme
        // 3. Otherwise use a random color scheme
        let colors: number[][];

        if (options.colors) {
          // Use explicitly provided colors
          colors = options.colors;
        } else if (options.themeName) {
          // Use the specified theme
          colors = this.getColorScheme(options.themeName);
        } else {
          // Use a random color scheme
          colors = this.getRandomColorScheme();
        }

        // Initialize gradient with configuration
        const gradient = new GradientInstance({
          element: container,
          colors: colors,
          speed: options.speed !== undefined ? options.speed : this.config.defaultSpeed,
          amplitude: options.amplitude !== undefined ? options.amplitude : this.config.defaultAmplitude,
          darkerTop: options.darkerTop || false,
          parallax: options.parallax !== undefined ? options.parallax : false,
          parallaxIntensity: options.parallaxIntensity !== undefined ? options.parallaxIntensity : this.config.parallaxIntensity
        });

        // Store reference to the gradient instance
        this.gradients.set(id, gradient);
      } catch (error) {
        console.error('Error initializing WebGL gradient:', error);
        // Apply CSS fallback in case of errors
        this.applyCssFallback(container, options.colors || this.config.defaultColors);
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

  constructor(options: {
    element: HTMLElement;
    colors: number[][];
    speed: number;
    amplitude: number;
    darkerTop: boolean;
    parallax: boolean;
    parallaxIntensity: number;
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

    // Initialize color interpolation
    this.currentColors = JSON.parse(JSON.stringify(this.config.colors));
    this.targetColors = JSON.parse(JSON.stringify(this.config.colors));

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
    this.width = options.element.offsetWidth || options.element.clientWidth || window.innerWidth;
    this.height = options.element.offsetHeight || options.element.clientHeight || window.innerHeight;
    
    // Set actual canvas buffer size (Safari needs explicit values)
    this.canvas.width = this.width;
    this.canvas.height = this.height;

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

    // Setup shaders and WebGL program
    this.initializeShaders();
    this.resize();
    this.setColors();
    
    // Safari-specific: Force initial render before starting animation
    // This ensures the canvas is properly initialized
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Start animation
    this.animate();

    // Add resize listener
    window.addEventListener('resize', this.resize.bind(this));
    
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
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
      this.scrollListenerAdded = true;

      // Initial scroll position
      this.scrollY = window.scrollY || window.pageYOffset;
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
      precision mediump float;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = 0.5 * (position + 1.0);
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader program for smooth gradient blending
    const fragmentShaderSource = `
      precision mediump float;
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

  private resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    // Get dimensions with fallbacks for Safari
    const newWidth = parent.offsetWidth || parent.clientWidth || window.innerWidth;
    const newHeight = parent.offsetHeight || parent.clientHeight || window.innerHeight;
    
    // Safari fix: Don't resize if dimensions are zero or invalid
    if (newWidth <= 0 || newHeight <= 0) {
      return;
    }
    
    // Only resize if dimensions actually changed (optimization)
    if (this.width === newWidth && this.height === newHeight) {
      return;
    }

    this.width = newWidth;
    this.height = newHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.gl.viewport(0, 0, this.width, this.height);

    this.gl.useProgram(this.program);
    this.gl.uniform2f(this.uniforms.u_resolution, this.width, this.height);
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
    // Stop animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', this.resize.bind(this));

    if (this.scrollListenerAdded) {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
      this.scrollListenerAdded = false;
    }

    // Remove the canvas from DOM
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
