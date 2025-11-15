import { Component, OnInit } from '@angular/core';
import { WebGLGradientService } from '../../services/webgl-gradient.service';
import { HomeDataService } from '../../services/home-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isPortfolioDone: boolean = false;
  isBlogDone: boolean = false;
  isDownloadCVDone: boolean = false;

  constructor(
    private webglGradientService: WebGLGradientService,
    private homeDataService: HomeDataService
  ) {}

  ngOnInit(): void {
    this.homeDataService.getHeaderConfig().subscribe({
      next: (config) => {
        this.isPortfolioDone = config.isPortfolioDone;
        this.isBlogDone = config.isBlogDone;
        this.isDownloadCVDone = config.isDownloadCVDone;
      },
      error: (error) => {
        console.error('Error loading header config:', error);
      }
    });
  }

  /**
   * Apply a random theme to all gradient containers
   */
  setRandomTheme(): void {
    // Find all WebGL background containers in the document
    const containers = document.querySelectorAll('[data-gradient-id]');

    // Remove and reapply gradients with a random theme
    containers.forEach(container => {
      this.webglGradientService.removeGradient(container as HTMLElement);
      this.webglGradientService.applyGradient(container as HTMLElement);
    });
  }
}
