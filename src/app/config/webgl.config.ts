/**
 * Centralized configuration for WebGL background and dynamic reflections
 *
 * This is your single source of truth for all visual customization.
 * Modify values here to change colors, animation behavior, and reflection appearance.
 */

export interface ColorScheme {
  name: string;
  colors: number[][]; // Array of [R, G, B] values (0-255), typically 4 colors for smooth gradient
  accentColor: string; // CSS color string for UI accent (links, badges, highlights)
}

export interface BackgroundConfig {
  // Color Schemes
  colorSchemes: ColorScheme[];
  defaultTheme: string;

  // Animation Settings
  // Animation speed multiplier (0.1 = very slow, 1.0 = normal, 2.0 = fast)
  speed: number;
  // Wave amplitude (0.0 = static gradient, 0.5 = subtle movement, 1.0 = strong waves)
  amplitude: number;
  // Enable darker top effect (true = gradient fades to darker at top, false = uniform)
  darkerTop: boolean;
  // Enable parallax scrolling effect (true = background moves slower than scroll)
  parallax: boolean;
  // Parallax intensity (0.0 = no parallax, 0.5 = moderate, 1.0 = strong parallax)
  parallaxIntensity: number;

  // Performance Settings
  // Cap render FPS (e.g., 30 for smoother perf on GPU/CPU)
  targetFps: number;
  // Clamp devicePixelRatio to reduce GPU load (e.g., 1.5)
  maxDpr: number;
  // Additional scale to render at lower resolution (0.6 - 1.0)
  renderScale: number;
  // Blur applied to the canvas to hide low-res artifacts
  blurPx: number;
  // Max frame delta to avoid animation jumps after pauses
  maxDeltaMs: number;
}

export interface ReflectionConfig {
  // Color Settings
  lightenFactor: number;      // Multiply base color brightness (1.0 = same as background, 1.25 = 25% brighter, 2.0 = very bright)
  saturationFactor: number;   // Multiply saturation (1.0 = original, 0.8 = slightly desaturated, 0.6 = more neutral)
  lightnessBoost: number;     // Add to lightness (0.0 = none, 0.05 = subtle lift, 0.10 = noticeable lift)
  updateThrottle: number;      // Throttle updates in milliseconds (50 = frequent, 100 = balanced, 200 = less frequent)
}

export const webglConfig = {
  background: {
    /**
     * Color Schemes
     * Each scheme contains 4 RGB colors that blend together to create the gradient.
     * Colors are ordered from darkest (index 0) to brightest (index 3).
     *
     * Examples:
     * - Ocean Blue: Cool, professional look with blue tones
     * - Neon Cyan: Vibrant, modern look matching cyan accent colors
     * - Deep Purple: Rich, luxurious appearance
     * - Amber Glow: Warm, cozy atmosphere
     */
    colorSchemes: [

      {
        name: 'Deep Purple',
        colors: [
          [20, 15, 35],
          [45, 30, 70],
          [90, 60, 140],
          [140, 100, 200],
        ],
        accentColor: '#b794f4'
      },
      {
        name: 'Amber Glow',
        colors: [
          [40, 25, 15],
          [80, 50, 25],
          [200, 120, 50],
          [255, 180, 100],
        ],
        accentColor: '#ffd866'
      },
      {
        name: 'Ocean Blue',
        colors: [
          [19, 41, 75],
          [34, 87, 126],
          [56, 149, 211],
          [88, 204, 237],
        ],
        accentColor: '#64d8ff'
      },
      {
        name: 'Emerald Forest',
        colors: [
          [15, 30, 20],
          [25, 60, 40],
          [40, 120, 80],
          [80, 200, 140],
        ],
        accentColor: '#64ffda'
      },
      {
        name: 'Magenta Dream',
        colors: [
          [35, 15, 30],
          [70, 25, 60],
          [150, 50, 130],
          [220, 100, 200],
        ],
        accentColor: '#ff7eb3'
      },
      {
        name: 'Slate Storm',
        colors: [
          [10, 15, 20],
          [30, 40, 50],
          [60, 80, 100],
          [120, 140, 150],
        ],
        accentColor: '#a8c5da'
      },
      {
        name: 'Sunset Horizon',
        colors: [
          [30, 20, 35],
          [80, 40, 60],
          [180, 80, 100],
          [255, 150, 120],
        ],
        accentColor: '#ff9a8b'
      },
      {
        name: 'Cupertino Aurora',
        colors: [
          [10, 12, 18],
          [18, 30, 58],
          [0, 122, 255],
          [100, 210, 255],
        ],
        accentColor: '#5ac8fa'
      }
    ],

    /**
     * Default Theme
     * The color scheme used when no specific theme is selected.
     * Examples: 'Neon Cyan', 'Ocean Blue', 'Deep Purple', etc.
     */
  defaultTheme: 'Emerald Forest',

    /**
     * Animation Speed
     * Controls how fast the gradient animates and flows.
     * - 0.1: Very slow, subtle movement (meditative feel)
     * - 0.5: Moderate speed, smooth and pleasant (default)
     * - 1.0: Normal speed, noticeable movement
     * - 2.0: Fast, dynamic and energetic
     */
    speed: 0.75,

    /**
     * Wave Amplitude
     * Controls the intensity of the noise-based wave movement.
     * - 0.0: Static gradient, no movement (flat appearance)
     * - 0.25: Subtle movement, gentle waves
     * - 0.85: Strong movement, visible waves and patterns (default)
     * - 1.0: Maximum movement, very dynamic and organic
     */
    amplitude: 0.85,

    /**
     * Darker Top Effect
     * When enabled, the gradient becomes progressively darker toward the top.
     * - true: Creates depth, like light coming from below
     * - false: Uniform gradient across entire area (default)
     */
    darkerTop: true,

    /**
     * Parallax Scrolling
     * When enabled, the background moves at a different speed than page content.
     * - true: Background moves slower, creating depth illusion (default)
     * - false: Background stays fixed with page scroll
     */
    parallax: true,

    /**
     * Parallax Intensity
     * How much the background moves relative to scroll (only applies if parallax is true).
     * - 0.0: No parallax movement
     * - 0.5: Moderate parallax, subtle depth effect (default)
     * - 1.0: Strong parallax, pronounced depth effect
     */
    parallaxIntensity: 0.5,

    /**
     * Performance Cap (FPS)
     * Limits render rate to reduce CPU/GPU usage.
     * - 24: cinematic, very light
     * - 30: smooth, balanced (default)
     * - 45: near-full, still cheaper than 60
     */
    targetFps: 120,

    /**
     * DPR Clamp
     * Limits the internal canvas resolution to reduce GPU memory.
     */
    maxDpr: 1.5,

    /**
     * Render Scale
     * Multiplier applied after DPR clamp to further reduce resolution.
     */
    renderScale: 0.75,

    /**
     * Canvas Blur
     * Softens the upscaled gradient to hide low-res artifacts.
     */
    blurPx: 16,

    /**
     * Max Delta
     * Caps animation time step to avoid large jumps after tab inactivity.
     */
    maxDeltaMs: 100,

  } as BackgroundConfig,

  reflection: {
    /**
     * Lighten Factor
     * Multiplies the base gradient color brightness for reflections.
     * Makes reflections appear brighter than the background they reflect.
     * - 1.0: Same brightness as background (subtle reflection)
     * - 1.25: 25% brighter (default - natural glass reflection)
     * - 1.5: 50% brighter (more prominent reflection)
     * - 2.0: Double brightness (very bright, dramatic reflection)
     */
    lightenFactor: 1.25,

    /**
     * Saturation Factor
     * Reduces color intensity so reflections feel softer and more glass-like.
     * - 1.0: Original saturation (vivid)
     * - 0.8: Slightly desaturated (default)
     * - 0.6: More neutral, muted reflection
     */
    saturationFactor: 0.7,

    /**
     * Lightness Boost
     * Lifts reflection lightness for better contrast against the background.
     * - 0.0: No lift
     * - 0.06: Subtle lift (default)
     * - 0.12: Noticeable lift
     */
    lightnessBoost: 0.08,

    /**
     * Update Throttle
     * How often reflection colors are updated (in milliseconds).
     * CSS transitions handle smooth interpolation between updates.
     * - 100: Frequent updates (higher CPU, smoother but diminishing returns)
     * - 500: Balanced - matches WebGL gradient transition duration (default)
     * - 1000: Less frequent, relies heavily on CSS transitions
     */
    updateThrottle: 100,

  } as ReflectionConfig,

} as const;

// Helper functions for backward compatibility and convenience
export function getColorScheme(themeName: string): number[][] | undefined {
  const scheme = webglConfig.background.colorSchemes.find(s => s.name === themeName);
  return scheme?.colors;
}

export function getDefaultColorScheme(): number[][] {
  const scheme = webglConfig.background.colorSchemes.find(
    s => s.name === webglConfig.background.defaultTheme
  );
  return scheme?.colors || webglConfig.background.colorSchemes[0].colors;
}

export function getThemeNames(): string[] {
  return webglConfig.background.colorSchemes.map(s => s.name);
}

export function getAccentColor(themeName: string): string | undefined {
  const scheme = webglConfig.background.colorSchemes.find(s => s.name === themeName);
  return scheme?.accentColor;
}

export function getDefaultAccentColor(): string {
  const scheme = webglConfig.background.colorSchemes.find(
    s => s.name === webglConfig.background.defaultTheme
  );
  return scheme?.accentColor || webglConfig.background.colorSchemes[0].accentColor;
}
