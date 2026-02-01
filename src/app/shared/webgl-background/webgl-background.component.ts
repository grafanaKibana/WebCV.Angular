import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { WebGLGradientService } from '../../services/webgl-gradient.service';
import { DynamicReflectionService } from '../../services/dynamic-reflection.service';

@Component({
  selector: 'app-webgl-background',
  templateUrl: './webgl-background.component.html',
  styleUrls: ['./webgl-background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebGLBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  speed = 0.5;             // Animation speed (increased for more movement)
  amplitude = 0.85;        // Wave amplitude (increased for more visible variation)
  darkerTop = false;       // Enable darker top effect
  themeName?: string;      // Name of predefined color scheme
  parallax = true;         // Enable parallax scrolling effect
  parallaxIntensity = 0.5; // Parallax intensity (0-1)

  constructor(
    private elementRef: ElementRef,
    private webglGradientService: WebGLGradientService,
    private dynamicReflectionService: DynamicReflectionService
  ) {}

  ngOnInit(): void {
    // Load persisted theme name early so AfterViewInit uses it.
    this.themeName = this.webglGradientService.getSavedThemeName();
  }
  
  ngAfterViewInit(): void {
    // Safari-specific: Use setTimeout to ensure DOM is fully rendered
    // This fixes the "black background until inspector opened" issue
    setTimeout(() => {
      this.initGradient();
    }, 0);
  }

  ngOnDestroy(): void {
    const container = this.elementRef.nativeElement.querySelector('.webgl-background-container');
    if (container) {
      this.webglGradientService.removeGradient(container);
    }
    this.dynamicReflectionService.destroy();
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
        parallaxIntensity: this.parallaxIntensity,
        onColorsUpdate: (colors: number[][]) => {
          // Pass colors directly to reflection service for optimal performance
          this.dynamicReflectionService.updateReflectionColors(colors);
        },
        onBrightnessUpdate: (angle: number, brightness: number) => {
          // Update reflection angle based on where bright colors are positioned
          this.dynamicReflectionService.updateReflectionAngle(angle, brightness);
        }
      });
    }
  }
}
