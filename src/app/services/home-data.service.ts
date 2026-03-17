import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ExperienceModel } from '../pages/home/interfaces/experienceModel';
import { EducationModel } from '../pages/home/interfaces/educationModel';
import { SkillGroupModel } from '../pages/home/interfaces/skillModel';

export interface SidebarInfo {
  firstName: string;
  lastName: string;
  positionTitle: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  telegram: string;
  links: {
    gitHubLink: string;
    linkedInLink: string;
    repositoryLink: string;
  };
}

export interface AboutMeData {
  content: string;
}

export interface HeaderConfig {
  isBlogDone: boolean;
  isDownloadCVDone: boolean;
}

export interface HomeData {
  sidebar: SidebarInfo;
  aboutMe: AboutMeData;
  education: EducationModel[];
  experience: ExperienceModel[];
  skills: SkillGroupModel[];
  header: HeaderConfig;
}

/**
 * Service for loading and providing home page data from JSON configuration
 */
@Injectable({
  providedIn: 'root'
})
export class HomeDataService {
  private dataCache$: Observable<HomeData> | null = null;
  private readonly dataPath = 'assets/data/home-data.json';

  constructor(private http: HttpClient) {}

  /**
   * Loads home page data from JSON file
   * Uses caching to avoid multiple HTTP requests
   */
  getHomeData(): Observable<HomeData> {
    if (!this.dataCache$) {
      this.dataCache$ = this.http.get<HomeData>(this.dataPath).pipe(
        map(data => this.normalizeData(data)),
        catchError(error => {
          console.error('Error loading home data:', error);
          return of(this.getDefaultData());
        }),
        shareReplay(1)
      );
    }
    return this.dataCache$;
  }

  /**
   * Normalizes data by converting empty strings to null for optional fields
   */
  private normalizeData(data: HomeData): HomeData {
    return {
      ...data,
      experience: data.experience.map(exp => ({
        ...exp,
        endMonth: exp.endMonth === '' ? null : exp.endMonth,
        endYear: exp.endYear === '' ? null : exp.endYear
      }))
    };
  }

  /**
   * Gets sidebar information
   */
  getSidebarInfo(): Observable<SidebarInfo> {
    return this.getHomeData().pipe(
      map(data => data.sidebar)
    );
  }

  /**
   * Gets about me content
   */
  getAboutMe(): Observable<AboutMeData> {
    return this.getHomeData().pipe(
      map(data => data.aboutMe)
    );
  }

  /**
   * Gets education list
   */
  getEducation(): Observable<EducationModel[]> {
    return this.getHomeData().pipe(
      map(data => data.education)
    );
  }

  /**
   * Gets experience list
   */
  getExperience(): Observable<ExperienceModel[]> {
    return this.getHomeData().pipe(
      map(data => data.experience)
    );
  }

  /**
   * Gets skills list
   */
  getSkills(): Observable<SkillGroupModel[]> {
    return this.getHomeData().pipe(
      map(data => data.skills)
    );
  }

  /**
   * Gets header configuration
   */
  getHeaderConfig(): Observable<HeaderConfig> {
    return this.getHomeData().pipe(
      map(data => data.header)
    );
  }

  /**
   * Provides default data in case of loading error
   */
  private getDefaultData(): HomeData {
    return {
      sidebar: {
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
      },
      aboutMe: {
        content: ''
      },
      education: [],
      experience: [],
      skills: [],
      header: {
        isBlogDone: false,
        isDownloadCVDone: false
      }
    };
  }
}

