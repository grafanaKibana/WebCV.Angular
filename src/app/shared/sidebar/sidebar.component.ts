import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HomeDataService, SidebarInfo } from '../../services/home-data.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit, OnDestroy {
  sidebarReady = false;
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
          this.sidebarReady = true;
          this.sidebarInfo = data;
          this.links = data.links;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.sidebarReady = true;
          console.error('Error loading sidebar data:', error);
          this.cdr.markForCheck();
        }
      });
  }

  extractPathName(url: string): string {
    try {
      return new URL(url).pathname.split('/').filter(Boolean).pop() || '';
    } catch {
      return '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
