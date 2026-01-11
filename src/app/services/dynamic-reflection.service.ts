import { Injectable } from '@angular/core';
import { webglConfig } from '../config/webgl.config';

/**
 * Service to create dynamic reflections that match and animate with the WebGL background
 * Receives colors directly from the WebGL gradient for optimal performance
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicReflectionService {
  private lastColorUpdateTime: number = 0;
  private lastAngleUpdateTime: number = 0;
  private lastReflection?: { r: number; g: number; b: number };
  private lastAngle?: number;
  private lastBrightness?: number;

  /**
   * Update reflection colors based on gradient colors
   * @param colors Array of RGB color arrays from the WebGL gradient
   */
  updateReflectionColors(colors: number[][]): void {
    // Throttle updates to avoid excessive CSS recalculations
    const now = performance.now();
    if (now - this.lastColorUpdateTime < webglConfig.reflection.updateThrottle) {
      return;
    }
    this.lastColorUpdateTime = now;

    if (!colors || colors.length === 0) return;

    // Sample the first color (or average multiple colors for better representation)
    const avgColor = this.calculateAverageColor(colors);
    
    const { r: reflectionR, g: reflectionG, b: reflectionB } = this.tuneReflectionColor(avgColor);

    if (
      this.lastReflection &&
      this.lastReflection.r === reflectionR &&
      this.lastReflection.g === reflectionG &&
      this.lastReflection.b === reflectionB
    ) {
      return;
    }

    this.lastReflection = { r: reflectionR, g: reflectionG, b: reflectionB };

    // Batch CSS variable updates using requestAnimationFrame to align with paint cycle.
    requestAnimationFrame(() => {
      const root = document.documentElement;
      root.style.setProperty('--reflection-r', reflectionR.toString());
      root.style.setProperty('--reflection-g', reflectionG.toString());
      root.style.setProperty('--reflection-b', reflectionB.toString());
    });
  }

  /**
   * Update reflection gradient angle based on brightness distribution
   * @param angle Angle in degrees (0-360) indicating direction of reflection
   * @param brightness Overall brightness level (0-1)
   */
  updateReflectionAngle(angle: number, brightness: number): void {
    // Throttle updates separately from color updates
    const now = performance.now();
    if (now - this.lastAngleUpdateTime < webglConfig.reflection.updateThrottle) {
      return;
    }
    this.lastAngleUpdateTime = now;

    const normalizedAngle = Math.round(angle);
    const normalizedBrightness = Number(brightness.toFixed(2));

    if (this.lastAngle === normalizedAngle && this.lastBrightness === normalizedBrightness) {
      return;
    }

    this.lastAngle = normalizedAngle;
    this.lastBrightness = normalizedBrightness;

    // Update CSS variable for gradient direction
    requestAnimationFrame(() => {
      const root = document.documentElement;
      root.style.setProperty('--reflection-angle', `${normalizedAngle}deg`);
      root.style.setProperty('--reflection-brightness', normalizedBrightness.toString());
    });
  }

  /**
   * Re-apply the last known reflection values, if available.
   * Useful to avoid flashes when route content changes.
   */
  applyLastReflection(): void {
    if (!this.lastReflection && this.lastAngle === undefined && this.lastBrightness === undefined) {
      return;
    }

    const root = document.documentElement;
    if (this.lastReflection) {
      root.style.setProperty('--reflection-r', this.lastReflection.r.toString());
      root.style.setProperty('--reflection-g', this.lastReflection.g.toString());
      root.style.setProperty('--reflection-b', this.lastReflection.b.toString());
    }

    if (this.lastAngle !== undefined) {
      root.style.setProperty('--reflection-angle', `${this.lastAngle}deg`);
    }

    if (this.lastBrightness !== undefined) {
      root.style.setProperty('--reflection-brightness', this.lastBrightness.toString());
    }
  }

  /**
   * Calculate weighted average of colors, giving more weight to lighter colors
   * which are more visible in reflections
   */
  private calculateAverageColor(colors: number[][]): number[] {
    if (colors.length === 0) return [0, 0, 0];
    if (colors.length === 1) return colors[0];

    // Calculate luminance for each color
    const colorsWithLuminance = colors.map(color => {
      const luminance = (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;
      return { color, luminance };
    });

    // Weight colors by their luminance (brighter colors = more weight)
    let totalWeight = 0;
    const weightedSum = [0, 0, 0];

    colorsWithLuminance.forEach(({ color, luminance }) => {
      const weight = luminance + 0.1; // Add 0.1 to avoid zero weight
      totalWeight += weight;
      weightedSum[0] += color[0] * weight;
      weightedSum[1] += color[1] * weight;
      weightedSum[2] += color[2] * weight;
    });

    return [
      Math.round(weightedSum[0] / totalWeight),
      Math.round(weightedSum[1] / totalWeight),
      Math.round(weightedSum[2] / totalWeight)
    ];
  }

  private tuneReflectionColor(color: number[]): { r: number; g: number; b: number } {
    const scaled = color.map(channel =>
      Math.min(255, Math.floor(channel * webglConfig.reflection.lightenFactor))
    ) as [number, number, number];
    const { h, s, l } = this.rgbToHsl(scaled[0], scaled[1], scaled[2]);
    const tunedS = Math.min(1, Math.max(0, s * webglConfig.reflection.saturationFactor));
    const tunedL = Math.min(1, Math.max(0, l + webglConfig.reflection.lightnessBoost));
    const [r, g, b] = this.hslToRgb(h, tunedS, tunedL);
    return { r, g, b };
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l };
    }

    const delta = max - min;
    const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let h = 0;

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      default:
        h = (rNorm - gNorm) / delta + 4;
        break;
    }

    h /= 6;
    return { h, s, l };
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
      const gray = Math.round(l * 255);
      return [gray, gray, gray];
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = this.hueToRgb(p, q, h + 1 / 3);
    const g = this.hueToRgb(p, q, h);
    const b = this.hueToRgb(p, q, h - 1 / 3);

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  private hueToRgb(p: number, q: number, t: number): number {
    let hue = t;
    if (hue < 0) hue += 1;
    if (hue > 1) hue -= 1;
    if (hue < 1 / 6) return p + (q - p) * 6 * hue;
    if (hue < 1 / 2) return q;
    if (hue < 2 / 3) return p + (q - p) * (2 / 3 - hue) * 6;
    return p;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Reset CSS variables to default
    const root = document.documentElement;
    root.style.removeProperty('--reflection-r');
    root.style.removeProperty('--reflection-g');
    root.style.removeProperty('--reflection-b');
    root.style.removeProperty('--reflection-angle');
    root.style.removeProperty('--reflection-brightness');
    this.lastReflection = undefined;
    this.lastAngle = undefined;
    this.lastBrightness = undefined;
  }
}
