import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SkillGroupModel } from '../interfaces/skillModel';
import { HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-skills-section',
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss']
})
export class SkillsSectionComponent implements OnInit, OnDestroy {
  skills: Array<SkillGroupModel> = [];
  private readonly destroy$ = new Subject<void>();

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.homeDataService.getSkills()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SkillGroupModel[]) => {
          this.skills = data;
        },
        error: (error) => {
          console.error('Error loading skills data:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getSkillLevelName(level: number): string {
    switch (level) {
      case 3:
        return 'Advanced'
      case 2:
        return 'Intermediate'
      case 1:
        return 'Novice'
      default:
        return 'Unknown'
    }
  }
}
