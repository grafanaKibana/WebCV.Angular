import { Component, OnInit } from '@angular/core';
import { SkillGroupModel } from '../interfaces/skillModel';
import { HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-skills-section',
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss']
})
export class SkillsSectionComponent implements OnInit {
  skills: Array<SkillGroupModel> = [];

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.homeDataService.getSkills().subscribe({
      next: (data: SkillGroupModel[]) => {
        this.skills = data;
      },
      error: (error) => {
        console.error('Error loading skills data:', error);
      }
    });
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
