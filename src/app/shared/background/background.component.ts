import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GradientService } from '../../services/gradient.service';

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit, OnDestroy {
  @Input() baseColor = '#123524'; // Dark green as base color
  @Input() numGradients = 8; // Increased for more visual impact
  @Input() animate = true; // Default to true for animation
  @Input() speed = 0.5; // Animation speed (0.5 is medium)
  @Input() parallax = true; // Enable parallax scrolling effect
  @Input() refreshInterval?: number; // in milliseconds, undefined means no refresh

  private intervalId?: number;

  constructor(private gradientService: GradientService) {
    console.log('Background component initialized');
  }

  ngOnInit(): void {
    console.log(`Background initialized with: animate=${this.animate}, gradients=${this.numGradients}, speed=${this.speed}, parallax=${this.parallax}`);
    
    // Only use refresh interval when not animating
    if (!this.animate && this.refreshInterval) {
      this.intervalId = window.setInterval(() => {
        console.log('Refreshing static gradient');
        // Force refresh by triggering change detection
        this.numGradients = this.numGradients === 10 ? 10.1 : 10;
      }, this.refreshInterval);
    }
  }
  
  ngOnDestroy(): void {
    // Clean up interval if it exists
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    
    // Clean up any gradient service resources
    this.gradientService.cleanUp();
  }
}
