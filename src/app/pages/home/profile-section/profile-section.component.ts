import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HomeDataService, SidebarInfo } from '../../../services/home-data.service';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  templateUrl: './profile-section.component.html',
  styleUrls: ['./profile-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSectionComponent implements OnInit, OnDestroy {
  profileReady = false;
  sidebarInfo: SidebarInfo = {
    firstName: '',
    lastName: '',
    positionTitle: '',
    city: '',
    country: '',
    email: '',
    phone: '',
    telegram: '',
    links: {
      gitHubLink: '',
      linkedInLink: '',
      repositoryLink: ''
    }
  };

  links = {
    gitHubLink: '',
    linkedInLink: '',
    repositoryLink: ''
  };

  private readonly destroy$ = new Subject<void>();
  private readonly homeDataService = inject(HomeDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.homeDataService.getSidebarInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SidebarInfo) => {
          this.profileReady = true;
          this.sidebarInfo = data;
          this.links = data.links;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.profileReady = true;
          console.error('Error loading profile data:', error);
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
