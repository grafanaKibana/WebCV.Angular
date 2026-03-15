import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HomeDataService, SidebarInfo } from '../../services/home-data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
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

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.homeDataService.getSidebarInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SidebarInfo) => {
          this.sidebarReady = true;
          this.sidebarInfo = data;
          this.links = data.links;
        },
        error: (error) => {
          this.sidebarReady = true;
          console.error('Error loading sidebar data:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
