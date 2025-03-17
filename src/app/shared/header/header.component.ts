import { Component, OnInit } from '@angular/core';
import { WebGLGradientService } from '../../services/webgl-gradient.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isPortfolioDone: boolean = true;
  isBlogDone: boolean = true;
  isDownloadCVDone = false;

  constructor(private webglGradientService: WebGLGradientService) { }

  ngOnInit(): void {
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
