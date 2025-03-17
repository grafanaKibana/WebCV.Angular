import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { WebGLGradientService } from '../../../services/webgl-gradient.service';

@Component({
  selector: 'app-header-color-scheme-selector',
  templateUrl: './header-color-scheme-selector.component.html',
  styleUrls: ['./header-color-scheme-selector.component.scss']
})
export class HeaderColorSchemeSelectorComponent implements OnInit {
  isDropdownOpen = false;
  colorSchemes: Map<string, number[][]> = new Map();
  selectedThemeName: string | null = null; // null means random scheme
  schemeNames: string[] = [];

  constructor(
    private webglGradientService: WebGLGradientService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    // Get theme names from service
    this.schemeNames = this.webglGradientService.getThemeNames();
    
    // Load all color schemes
    this.schemeNames.forEach(themeName => {
      this.colorSchemes.set(themeName, this.webglGradientService.getColorScheme(themeName));
    });
    
    // Set initial scheme as random
    this.selectedThemeName = null;
  }

  /**
   * Toggle the dropdown menu
   */
  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent click from propagating to document
    }
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    // Only handle this if dropdown is open
    if (!this.isDropdownOpen) return;
    
    // Check if click was inside our component
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  /**
   * Convert RGB array to CSS color string
   */
  getRgbString(color: number[]): string {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  /**
   * Select a color scheme and apply it
   */
  selectColorScheme(themeName: string | null, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // Prevent event bubbling
    }
    
    this.selectedThemeName = themeName;
    
    // Find all WebGL background containers in the document
    const containers = document.querySelectorAll('[data-gradient-id]');
    
    // Remove and reapply gradients with the new color scheme
    containers.forEach(container => {
      this.webglGradientService.removeGradient(container as HTMLElement);
      this.webglGradientService.applyGradient(container as HTMLElement, {
        themeName: themeName || undefined
      });
    });
    
    // Close dropdown after selection
    this.isDropdownOpen = false;
  }

  /**
   * Get the current theme name or 'Random' if no theme is selected
   */
  getCurrentThemeName(): string {
    return this.selectedThemeName || 'Random';
  }
} 