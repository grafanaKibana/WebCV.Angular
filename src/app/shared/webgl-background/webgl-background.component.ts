import { Component, OnInit, OnDestroy, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { WebGLGradientService } from '../../services/webgl-gradient.service';

@Component({
  selector: 'app-webgl-background',
  templateUrl: './webgl-background.component.html',
  styleUrls: ['./webgl-background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebGLBackgroundComponent implements OnInit, OnDestroy {
  speed = 0.3;             // Animation speed
  amplitude = 0.7;         // Wave amplitude (intensity)
  darkerTop = false;       // Enable darker top effect
  themeName?: string;      // Name of predefined color scheme
  parallax = true;         // Enable parallax scrolling effect
  parallaxIntensity = 0.5; // Parallax intensity (0-1)

  constructor(
    private elementRef: ElementRef,
    private webglGradientService: WebGLGradientService
  ) {}

  ngOnInit(): void {
    this.initGradient();
  }

  ngOnDestroy(): void {
    const container = this.elementRef.nativeElement.querySelector('.webgl-background-container');
    if (container) {
      this.webglGradientService.removeGradient(container);
    }
  }

  /**
   * Get all available color schemes
   * @returns Map of color schemes with theme names as keys
   */
  getColorSchemes(): Map<string, number[][]> {
    const schemes = new Map<string, number[][]>();
    const themeNames = this.webglGradientService.getThemeNames();

    themeNames.forEach(themeName => {
      schemes.set(themeName, this.webglGradientService.getColorScheme(themeName));
    });

    return schemes;
  }

  /**
   * Get a specific color scheme by theme name
   * @param themeName The name of the color scheme
   * @returns The color scheme array
   */
  getColorScheme(themeName: string): number[][] {
    return this.webglGradientService.getColorScheme(themeName);
  }

  /**
   * Initialize or reinitialize the gradient with current settings
   */
  initGradient(): void {
    const container = this.elementRef.nativeElement.querySelector('.webgl-background-container');

    if (container) {
      this.webglGradientService.applyGradient(container, {
        speed: this.speed,
        amplitude: this.amplitude,
        darkerTop: this.darkerTop,
        themeName: this.themeName,
        parallax: this.parallax,
        parallaxIntensity: this.parallaxIntensity
      });
    }
  }
}
