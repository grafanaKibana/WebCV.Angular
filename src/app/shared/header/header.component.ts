import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebGLGradientService } from '../../services/webgl-gradient.service';
import { HomeDataService } from '../../services/home-data.service';
import { CvDownloadService } from '../../services/cv-download.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  headerReady = false;
  isPortfolioDone: boolean = false;
  isBlogDone: boolean = false;
  isDownloadCVDone: boolean = false;
  isDownloading: boolean = false;
  downloadDelayMs: number = environment.cvDownloadSimulatedDelayMs;
  private readonly destroy$ = new Subject<void>();
  private readonly webglGradientService = inject(WebGLGradientService);
  private readonly homeDataService = inject(HomeDataService);
  private readonly cvDownloadService = inject(CvDownloadService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.homeDataService.getHeaderConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.headerReady = true;
          this.isPortfolioDone = config.isPortfolioDone;
          this.isBlogDone = config.isBlogDone;
          this.isDownloadCVDone = config.isDownloadCVDone;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.headerReady = true;
          console.error('Error loading header config:', error);
          this.cdr.markForCheck();
        }
      });

    const currentTheme =
      this.webglGradientService.getSavedThemeName() ?? this.webglGradientService.getDefaultThemeName();
    this.webglGradientService.applyAccentColor(currentTheme);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Apply the next theme (in config order) to all gradient containers with smooth transition
   */
  setRandomTheme(): void {
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
    if (this.isDownloading || !this.isDownloadCVDone) {
      return;
    }

    this.isDownloading = true;
    this.cvDownloadService.downloadCv(this.downloadDelayMs)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDownloading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error downloading CV:', error);
          this.isDownloading = false;
          this.cdr.markForCheck();
        }
      });
  }
}
