import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AboutMeSectionComponent } from './about-me-section.component';
import { HomeDataService } from '../../../services/home-data.service';

describe('AboutMeSectionComponent', () => {
  let component: AboutMeSectionComponent;
  let fixture: ComponentFixture<AboutMeSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutMeSectionComponent],
      providers: [
        {
          provide: HomeDataService,
          useValue: { getAboutMe: () => of({ content: 'Test about me content' }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutMeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load about me data on init', () => {
    expect(component.aboutMe().content).toBe('Test about me content');
  });
});
