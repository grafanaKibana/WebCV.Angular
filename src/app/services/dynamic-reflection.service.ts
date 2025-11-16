import { Injectable } from '@angular/core';
import { webglConfig } from '../config/webgl-config';

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
  private readonly UPDATE_THROTTLE = webglConfig.reflection.updateThrottle;

  /**
   * Update reflection colors based on gradient colors
   * @param colors Array of RGB color arrays from the WebGL gradient
   */
  updateReflectionColors(colors: number[][]): void {
    // Throttle updates to avoid excessive CSS recalculations
    const now = performance.now();
    if (now - this.lastColorUpdateTime < this.UPDATE_THROTTLE) {
      return;
    }
    this.lastColorUpdateTime = now;

    if (!colors || colors.length === 0) return;

    // Sample the first color (or average multiple colors for better representation)
    const avgColor = this.calculateAverageColor(colors);
    
    // Create lighter versions for reflections using configured lighten factor
    const lightenFactor = webglConfig.reflection.lightenFactor;
    const reflectionR = Math.min(255, Math.floor(avgColor[0] * lightenFactor));
    const reflectionG = Math.min(255, Math.floor(avgColor[1] * lightenFactor));
    const reflectionB = Math.min(255, Math.floor(avgColor[2] * lightenFactor));

    // Batch CSS variable updates for optimal performance
    // Using requestAnimationFrame ensures updates happen during repaint cycle
    requestAnimationFrame(() => {
      const root = document.documentElement;
      // Batch all style updates together to minimize reflow/repaint
      root.style.cssText += `
        --reflection-r: ${reflectionR};
        --reflection-g: ${reflectionG};
        --reflection-b: ${reflectionB};
      `;
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
    if (now - this.lastAngleUpdateTime < this.UPDATE_THROTTLE) {
      return;
    }
    this.lastAngleUpdateTime = now;

    // Update CSS variable for gradient direction
    requestAnimationFrame(() => {
      const root = document.documentElement;
      root.style.setProperty('--reflection-angle', `${Math.round(angle)}deg`);
      root.style.setProperty('--reflection-brightness', brightness.toFixed(2));
    });
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
  }
}

