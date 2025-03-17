import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { GradientService } from '../services/gradient.service';

@Directive({
  selector: '[appMeshGradient]'
})
export class MeshGradientDirective implements OnInit, OnChanges, OnDestroy {
  @Input() baseColor?: string;
  @Input() numGradients?: number;
  @Input() refreshOnHover = false;
  @Input() animate = false;
  @Input() speed = 0.5; // Default animation speed
  @Input() parallax = false; // Enable parallax scrolling effect

  constructor(
    private el: ElementRef,
    private gradientService: GradientService
  ) { }

  ngOnInit(): void {
    this.applyGradient();

    if (this.refreshOnHover) {
      this.el.nativeElement.addEventListener('mouseenter', () => {
        this.applyGradient();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Apply the gradient whenever inputs change
    if (changes['baseColor'] || changes['numGradients'] || 
        changes['animate'] || changes['speed'] || changes['parallax']) {
      this.applyGradient();
    }
  }

  ngOnDestroy(): void {
    // Make sure to apply with animate=false to clean up any animation loops
    this.gradientService.applyMeshGradient(
      this.el.nativeElement,
      this.baseColor,
      this.numGradients,
      false
    );
  }

  private applyGradient(): void {
    this.gradientService.applyMeshGradient(
      this.el.nativeElement,
      this.baseColor,
      this.numGradients,
      this.animate,
      this.speed,
      this.parallax
    );
  }
}
