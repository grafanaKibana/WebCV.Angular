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

  // Pre-allocated buffer for average color calculation to avoid GC pressure
  private avgColorResult: number[] = [0, 0, 0];

  /**
   * Calculate weighted average of colors, giving more weight to lighter colors
   * which are more visible in reflections
   */
  private calculateAverageColor(colors: number[][]): number[] {
    if (colors.length === 0) return this.avgColorResult;
    if (colors.length === 1) return colors[0];

    // Weight colors by their luminance (brighter colors = more weight)
    // Avoid creating intermediate objects by calculating inline
    let totalWeight = 0;
    let weightedR = 0, weightedG = 0, weightedB = 0;

    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      const luminance = (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;
      const weight = luminance + 0.1; // Add 0.1 to avoid zero weight
      totalWeight += weight;
      weightedR += color[0] * weight;
      weightedG += color[1] * weight;
      weightedB += color[2] * weight;
    }

    // Reuse pre-allocated array
    this.avgColorResult[0] = Math.round(weightedR / totalWeight);
    this.avgColorResult[1] = Math.round(weightedG / totalWeight);
    this.avgColorResult[2] = Math.round(weightedB / totalWeight);
    return this.avgColorResult;
  }

  // Pre-allocated buffer for tuned color to avoid GC pressure
  private tunedColorResult = { r: 0, g: 0, b: 0 };
  private scaledColor: [number, number, number] = [0, 0, 0];

  private tuneReflectionColor(color: number[]): { r: number; g: number; b: number } {
    // Avoid creating new array with map
    this.scaledColor[0] = Math.min(255, Math.floor(color[0] * webglConfig.reflection.lightenFactor));
    this.scaledColor[1] = Math.min(255, Math.floor(color[1] * webglConfig.reflection.lightenFactor));
    this.scaledColor[2] = Math.min(255, Math.floor(color[2] * webglConfig.reflection.lightenFactor));
    const scaled = this.scaledColor;
    const hsl = this.rgbToHsl(scaled[0], scaled[1], scaled[2]);
    const tunedS = Math.min(1, Math.max(0, hsl.s * webglConfig.reflection.saturationFactor));
    const tunedL = Math.min(1, Math.max(0, hsl.l + webglConfig.reflection.lightnessBoost));
    const rgb = this.hslToRgb(hsl.h, tunedS, tunedL);
    // Reuse pre-allocated result object
    this.tunedColorResult.r = rgb[0];
    this.tunedColorResult.g = rgb[1];
    this.tunedColorResult.b = rgb[2];
    return this.tunedColorResult;
  }

  // Pre-allocated buffers for color conversion to avoid GC pressure
  private hslResult = { h: 0, s: 0, l: 0 };
  private rgbResult: [number, number, number] = [0, 0, 0];

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const l = (max + min) / 2;

    if (max === min) {
      this.hslResult.h = 0;
      this.hslResult.s = 0;
      this.hslResult.l = l;
      return this.hslResult;
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
    this.hslResult.h = h;
    this.hslResult.s = s;
    this.hslResult.l = l;
    return this.hslResult;
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
      const gray = Math.round(l * 255);
      this.rgbResult[0] = gray;
      this.rgbResult[1] = gray;
      this.rgbResult[2] = gray;
      return this.rgbResult;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    this.rgbResult[0] = Math.round(this.hueToRgb(p, q, h + 1 / 3) * 255);
    this.rgbResult[1] = Math.round(this.hueToRgb(p, q, h) * 255);
    this.rgbResult[2] = Math.round(this.hueToRgb(p, q, h - 1 / 3) * 255);

    return this.rgbResult;
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
