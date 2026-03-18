import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CvDownloadService } from '../../services/cv-download.service';
import { HomeDataService } from '../../services/home-data.service';
import { WebGLGradientService } from '../../services/webgl-gradient.service';

@Component({
    selector: 'app-header',
    imports: [RouterLink],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly isDownloading = signal(false);
  readonly downloadDelayMs = environment.cvDownloadSimulatedDelayMs;

  private readonly webglGradientService = inject(WebGLGradientService);
  private readonly homeDataService = inject(HomeDataService);
  private readonly cvDownloadService = inject(CvDownloadService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly headerConfig = toSignal(
    this.homeDataService.getHeaderConfig().pipe(
      catchError((error) => {
        console.error('Error loading header config:', error);
        return of(null);
      })
    )
  );

  readonly headerReady = computed(() => this.headerConfig() !== undefined);
  readonly isBlogDone = computed(() => this.headerConfig()?.isBlogDone ?? false);
  readonly isDownloadCVDone = computed(() => this.headerConfig()?.isDownloadCVDone ?? false);

  constructor() {
    const currentTheme =
      this.webglGradientService.getSavedThemeName() ?? this.webglGradientService.getDefaultThemeName();
    this.webglGradientService.applyAccentColor(currentTheme);
  }

  /**
   * Apply the next theme (in config order) to all gradient containers with smooth transition
   */
  setRandomTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Find all WebGL background containers in the document
    const containers = document.querySelectorAll('[data-gradient-id]');

    const currentThemeName =
      this.webglGradientService.getSavedThemeName() ?? this.webglGradientService.getDefaultThemeName();

    const themeName = this.webglGradientService.getNextThemeName(currentThemeName);
    if (!themeName) {
      return;
    }

    this.webglGradientService.saveThemeName(themeName);
    this.webglGradientService.applyAccentColor(themeName);

    const colors = this.webglGradientService.getColorScheme(themeName);

    // Transition existing gradients to new colors smoothly
    containers.forEach(container => {
      const element = container as HTMLElement;
      const id = element.getAttribute('data-gradient-id');

      if (id) {
        // If gradient exists, transition smoothly
        this.webglGradientService.transitionGradientColors(element, colors);
      } else {
        // If no gradient exists, create new one
        this.webglGradientService.applyGradient(element, { themeName });
      }
    });
  }

  /**
   * Downloads the CV PDF from the latest successful GitHub Actions workflow run
   */
  downloadCv(): void {
    if (this.isDownloading() || !this.isDownloadCVDone()) {
      return;
    }

    this.isDownloading.set(true);
    this.cvDownloadService.downloadCv(this.downloadDelayMs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDownloading.set(false);
        },
        error: (error) => {
          console.error('Error downloading CV:', error);
          this.isDownloading.set(false);
        }
      });
  }
}
