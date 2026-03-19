import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './profile-section.component.html',
  styleUrls: ['./profile-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSectionComponent {
  private readonly homeDataService = inject(HomeDataService);
  readonly sidebarInfo = toSignal(
    this.homeDataService.getSidebarInfo().pipe(
      catchError((error) => {
        console.error('Error loading profile data:', error);
        return of(null);
      })
    )
  );
  readonly profileReady = computed(() => this.sidebarInfo() !== undefined);
  readonly links = computed(() => this.sidebarInfo()?.links ?? {
    gitHubLink: '',
    linkedInLink: '',
    repositoryLink: ''
  });
}
