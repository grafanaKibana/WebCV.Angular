/**
 * Centralized configuration for WebGL background and dynamic reflections
 *
 * This is your single source of truth for all visual customization.
 * Modify values here to change colors, animation behavior, and reflection appearance.
 */

export interface ColorScheme {
  name: string;
  colors: number[][]; // Array of [R, G, B] values (0-255), typically 4 colors for smooth gradient
}

export interface BackgroundConfig {
  // Color Schemes
  colorSchemes: ColorScheme[];
  defaultTheme: string; // Name of default color scheme to use on page load

  // Animation Settings
  speed: number;              // Animation speed multiplier (0.1 = very slow, 1.0 = normal, 2.0 = fast)
  amplitude: number;          // Wave amplitude (0.0 = static gradient, 0.5 = subtle movement, 1.0 = strong waves)
  darkerTop: boolean;         // Enable darker top effect (true = gradient fades to darker at top, false = uniform)
  parallax: boolean;          // Enable parallax scrolling effect (true = background moves slower than scroll)
  parallaxIntensity: number;  // Parallax intensity (0.0 = no parallax, 0.5 = moderate, 1.0 = strong parallax)
}

export interface ReflectionConfig {
  // Color Settings
  lightenFactor: number;      // Multiply base color brightness (1.0 = same as background, 1.25 = 25% brighter, 2.0 = very bright)
  saturationFactor: number;   // Multiply saturation (1.0 = original, 0.8 = slightly desaturated, 0.6 = more neutral)
  lightnessBoost: number;     // Add to lightness (0.0 = none, 0.05 = subtle lift, 0.10 = noticeable lift)

  // Opacity Settings (0.0 = transparent, 1.0 = fully opaque)
  opacityBase: number;         // Base reflection opacity (0.10 = subtle glow, 0.20 = more visible, 0.30 = strong)
  opacitySubtle: number;       // Subtle reflection opacity (0.08 = very subtle, 0.12 = noticeable)
  opacityStrong: number;       // Strong reflection opacity (0.15 = moderate, 0.25 = prominent)

  // Gradient Stops (0-100% - controls where reflection fades in/out)
  gradientStops: {
    start: number;             // Start position (0 = top/left edge, 20 = inset from edge)
    subtle: number;             // Subtle fade position (20 = early fade, 30 = later fade)
    mid: number;               // Mid fade position (45 = gradual, 50 = sharper transition)
    end: number;               // End position (65 = longer reflection, 70 = shorter)
    transparent: number;        // Fully transparent position (85 = long fade, 90 = quick fade)
  };

  // Animation Settings
  transitionDuration: number;   // CSS transition duration in seconds (0.3 = quick, 0.6 = smooth, 1.0 = slow)
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
        name: 'Ocean Blue',
        colors: [
          [19, 41, 75],     // Dark navy - deepest shadow areas
          [34, 87, 126],    // Navy blue - mid-dark tones
          [56, 149, 211],   // Medium blue - mid-bright tones
          [88, 204, 237],   // Light blue - brightest highlights
        ]
      },
      {
        name: 'Neon Cyan',
        colors: [
          [0, 20, 40],      // Deep midnight blue - darkest areas
          [0, 50, 80],      // Dark cyan-blue - shadow tones
          [0, 150, 200],    // Bright cyan - highlight tones
          [0, 187, 255],    // Neon cyan - brightest accents (matches site accent)
        ]
      },
      {
        name: 'Deep Purple',
        colors: [
          [20, 15, 35],     // Deep violet-black - rich dark base
          [45, 30, 70],     // Rich purple - mid-dark tones
          [90, 60, 140],    // Vibrant purple - bright tones
          [140, 100, 200],  // Light lavender - soft highlights
        ]
      },
      {
        name: 'Amber Glow',
        colors: [
          [40, 25, 15],     // Deep brown-orange - warm dark base
          [80, 50, 25],     // Dark amber - mid-dark warm tones
          [200, 120, 50],   // Warm amber - bright warm tones
          [255, 180, 100],  // Golden amber - golden highlights
        ]
      },
      {
        name: 'Emerald Forest',
        colors: [
          [15, 30, 20],     // Deep forest green - natural dark base
          [25, 60, 40],     // Dark emerald - rich mid-dark tones
          [40, 120, 80],    // Rich emerald - vibrant mid tones
          [80, 200, 140],   // Bright mint - fresh highlights
        ]
      },
      {
        name: 'Magenta Dream',
        colors: [
          [35, 15, 30],     // Deep magenta-black - rich dark base
          [70, 25, 60],     // Dark magenta - deep mid tones
          [150, 50, 130],   // Vibrant magenta - bright tones
          [220, 100, 200],  // Soft pink-magenta - soft highlights
        ]
      },
      {
        name: 'Slate Storm',
        colors: [
          [20, 25, 30],     // Charcoal - neutral dark base
          [40, 50, 60],     // Dark slate - cool mid-dark tones
          [80, 100, 120],   // Medium slate - balanced mid tones
          [140, 160, 180],  // Light slate blue - cool highlights
        ]
      },
      {
        name: 'Sunset Horizon',
        colors: [
          [30, 20, 35],     // Deep purple-pink - rich dark base
          [80, 40, 60],     // Dark rose - warm mid-dark tones
          [180, 80, 100],   // Coral pink - vibrant mid tones
          [255, 150, 120],  // Peach - warm highlights
        ]
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
    speed: 0.5,

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
    darkerTop: false,

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
     * Base Opacity
     * The standard opacity for reflection gradients.
     * - 0.05: Very subtle, barely visible
     * - 0.08: Subtle but noticeable (default)
     * - 0.20: More visible, prominent reflection
     * - 0.30: Strong, very visible reflection
     */
    opacityBase: 0.05,

    /**
     * Subtle Opacity
     * Used for softer reflection areas that fade more gently.
     * Should be slightly lower than base opacity.
     * - 0.04: Very subtle fade
     * - 0.06: Gentle fade (default)
     * - 0.12: More noticeable fade
     */
    opacitySubtle: 0.04,

    /**
     * Strong Opacity
     * Used for more prominent reflection highlights.
     * Should be higher than ase opacity.
     * - 0.10: Moderate highlight
     * - 0.12: Visible highlight (default)
     * - 0.25: Strong highlight, very visible
     */
    opacityStrong: 0.10,

    /**
     * Gradient Stops
     * Controls where the reflection gradient starts, fades, and ends.
     * Values are percentages (0-100) along the gradient direction.
     *
     * Example with default values:
     * - start: 0% - Reflection begins at the edge
     * - subtle: 20% - First fade point (subtle opacity)
     * - mid: 45% - Mid fade point (reduced opacity)
     * - end: 65% - Second fade point (very low opacity)
     * - transparent: 85% - Fully transparent (no reflection)
     *
     * Adjusting these values:
     * - Smaller gaps = sharper transitions
     * - Larger gaps = smoother, longer fades
     * - Lower transparent value = shorter reflection
     * - Higher transparent value = longer reflection
     */
    gradientStops: {
      start: 0,        // Reflection starts at edge (0 = immediate start, 10 = inset)
      subtle: 15,      // First fade point (15 = early fade, 25 = later fade)
      mid: 40,         // Mid fade point (40 = gradual, 50 = sharper)
      end: 60,         // Second fade point (60 = longer reflection, 70 = shorter)
      transparent: 80, // Fully transparent (80 = long fade, 90 = quick fade)
    },

    /**
     * Transition Duration
     * How long CSS transitions take when reflection colors/angles change.
     * IMPORTANT: Should match updateThrottle (in seconds) for seamless interpolation.
     * The CSS transition bridges the gap between JavaScript updates, creating
     * smooth continuous animation from discrete keyframes.
     */
    transitionDuration: 1.0,

    /**
     * Update Throttle
     * How often reflection colors are updated (in milliseconds).
     * CSS transitions (with linear easing) handle smooth interpolation between updates.
     * IMPORTANT: Should match transitionDuration (in ms) for seamless animation.
     * - 100: Frequent updates (higher CPU, smoother but diminishing returns)
     * - 500: Balanced updates
     * - 1000: Optimal - relies on CSS transitions for interpolation (default, lowest CPU)
     */
    updateThrottle: 1000,

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

export function getRandomColorScheme(): number[][] {
  const schemes = webglConfig.background.colorSchemes;
  const randomIndex = Math.floor(Math.random() * schemes.length);
  return schemes[randomIndex].colors;
}
