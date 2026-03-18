import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HomeDataService, HomeData } from './home-data.service';

describe('HomeDataService', () => {
  let service: HomeDataService;
  let httpMock: HttpTestingController;

  const mockHomeData: HomeData = {
    sidebar: {
      firstName: 'John',
      lastName: 'Doe',
      positionTitle: 'Engineer',
      city: 'Kyiv',
      country: 'Ukraine',
      email: 'test@test.com',
      phone: '+1234',
      telegram: '@test',
      links: { gitHubLink: 'gh', linkedInLink: 'li', repositoryLink: 'repo' }
    },
    aboutMe: { content: 'About me text' },
    education: [{
      educationalInstitution: 'MIT',
      degree: 'BSc',
      speciality: 'CS',
      startYear: '2015',
      endYear: '2019',
      description: 'desc'
    }],
    experience: [{
      positionTitle: 'Dev',
      company: 'Corp',
      startMonth: 'January',
      startYear: '2020',
      endMonth: '',
      endYear: '',
      description: { responsibilities: ['code'], aboutProject: 'proj', toolsAndTechnologies: 'TS' }
    }],
    skills: [{ name: 'Frontend', skills: [{ technology: 'Angular', level: 3 }] }],
    header: { isBlogDone: true, isDownloadCVDone: true }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(HomeDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch home data from JSON file', (done) => {
    service.getHomeData().subscribe({
      next: (data) => {
        expect(data.sidebar.firstName).toBe('John');
        expect(data.aboutMe.content).toBe('About me text');
        done();
      }
    });

    const req = httpMock.expectOne('assets/data/home-data.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockHomeData);
  });

  it('should cache data after first fetch', (done) => {
    service.getHomeData().subscribe();
    service.getHomeData().subscribe({
      next: (data) => {
        expect(data.sidebar.firstName).toBe('John');
        done();
      }
    });

    const req = httpMock.expectOne('assets/data/home-data.json');
    req.flush(mockHomeData);
  });

  it('should normalize empty endMonth/endYear to null', (done) => {
    service.getExperience().subscribe({
      next: (experience) => {
        expect(experience[0].endMonth).toBeNull();
        expect(experience[0].endYear).toBeNull();
        done();
      }
    });

    const req = httpMock.expectOne('assets/data/home-data.json');
    req.flush(mockHomeData);
  });

  it('should keep non-empty endMonth/endYear as-is', (done) => {
    const dataWithEndDate: HomeData = {
      ...mockHomeData,
      experience: [{
        ...mockHomeData.experience[0],
        endMonth: 'June',
        endYear: '2023'
      }]
    };

    service.getExperience().subscribe({
      next: (experience) => {
        expect(experience[0].endMonth).toBe('June');
        expect(experience[0].endYear).toBe('2023');
        done();
      }
    });

    const req = httpMock.expectOne('assets/data/home-data.json');
    req.flush(dataWithEndDate);
  });

  it('should return sidebar info', (done) => {
    service.getSidebarInfo().subscribe({
      next: (sidebar) => {
        expect(sidebar.firstName).toBe('John');
        expect(sidebar.lastName).toBe('Doe');
        done();
      }
    });

    httpMock.expectOne('assets/data/home-data.json').flush(mockHomeData);
  });

  it('should return about me data', (done) => {
    service.getAboutMe().subscribe({
      next: (aboutMe) => {
        expect(aboutMe.content).toBe('About me text');
        done();
      }
    });

    httpMock.expectOne('assets/data/home-data.json').flush(mockHomeData);
  });

  it('should return education list', (done) => {
    service.getEducation().subscribe({
      next: (education) => {
        expect(education.length).toBe(1);
        expect(education[0].educationalInstitution).toBe('MIT');
        done();
      }
    });

    httpMock.expectOne('assets/data/home-data.json').flush(mockHomeData);
  });

  it('should return skills list', (done) => {
    service.getSkills().subscribe({
      next: (skills) => {
        expect(skills.length).toBe(1);
        expect(skills[0].name).toBe('Frontend');
        done();
      }
    });

    httpMock.expectOne('assets/data/home-data.json').flush(mockHomeData);
  });

  it('should return header config', (done) => {
    service.getHeaderConfig().subscribe({
      next: (config) => {
        expect(config.isBlogDone).toBe(true);
        expect(config.isDownloadCVDone).toBe(true);
        done();
      }
    });

    httpMock.expectOne('assets/data/home-data.json').flush(mockHomeData);
  });

  it('should return default data on HTTP error', (done) => {
    service.getHomeData().subscribe({
      next: (data) => {
        expect(data.sidebar.firstName).toBe('');
        expect(data.aboutMe.content).toBe('');
        expect(data.education).toEqual([]);
        expect(data.experience).toEqual([]);
        expect(data.skills).toEqual([]);
        expect(data.header.isBlogDone).toBe(false);
        expect(data.header.isDownloadCVDone).toBe(false);
        done();
      }
    });

    httpMock.expectOne('assets/data/home-data.json').error(new ProgressEvent('Network error'));
  });
});
