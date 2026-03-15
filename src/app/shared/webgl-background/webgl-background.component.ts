import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { WebGLGradientService } from '../../services/webgl-gradient.service';
import { DynamicReflectionService } from '../../services/dynamic-reflection.service';
import { webglConfig } from '../../config/webgl.config';

@Component({
  selector: 'app-webgl-background',
  standalone: true,
  templateUrl: './webgl-background.component.html',
  styleUrls: ['./webgl-background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebGLBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  isReady = false;
  private hasFadedIn = false;
  // Defaults come from the centralized config so changes in `webgl.config.ts` take effect.
  speed = webglConfig.background.speed;
  amplitude = webglConfig.background.amplitude;
  darkerTop = webglConfig.background.darkerTop;
  themeName?: string;      // Name of predefined color scheme
  parallax = webglConfig.background.parallax;
  parallaxIntensity = webglConfig.background.parallaxIntensity;
  private readonly elementRef = inject(ElementRef);
  private readonly webglGradientService = inject(WebGLGradientService);
  private readonly dynamicReflectionService = inject(DynamicReflectionService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // Load persisted theme name early so AfterViewInit uses it.
    this.themeName = this.webglGradientService.getSavedThemeName();
  }
  
  ngAfterViewInit(): void {
    // Safari-specific: Use setTimeout to ensure DOM is fully rendered
    // This fixes the "black background until inspector opened" issue
    setTimeout(() => {
      this.initGradient();
      this.scheduleFadeIn();
    }, 0);
  }

  ngOnDestroy(): void {
    const container = this.elementRef.nativeElement.querySelector('.webgl-background-container');
    if (container) {
      this.webglGradientService.removeGradient(container);
    }
    this.dynamicReflectionService.destroy();
    this.isReady = false;
    this.hasFadedIn = false;
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
        }
      });
    }
  }

  private scheduleFadeIn(): void {
    if (this.hasFadedIn) {
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.hasFadedIn = true;
        this.isReady = true;
        this.changeDetectorRef.markForCheck();
      });
    });
  }
}
