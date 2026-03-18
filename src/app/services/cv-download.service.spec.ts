import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { CvDownloadService } from './cv-download.service';

describe('CvDownloadService', () => {
  let service: CvDownloadService;
  let httpMock: HttpTestingController;

  const mockWorkflowRun = {
    id: 123,
    status: 'completed',
    conclusion: 'success',
    head_branch: 'master',
    created_at: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(CvDownloadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call correct GitHub API URL', fakeAsync(() => {
    service.downloadCv(0).subscribe();
    tick(0);

    const req = httpMock.expectOne((r) =>
      r.url.includes('api.github.com/repos/grafanaKibana/LatexCV/actions/workflows/main.yml/runs')
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('branch')).toBe('master');
    expect(req.request.params.get('status')).toBe('success');
    expect(req.request.params.get('per_page')).toBe('1');

    req.flush({ workflow_runs: [mockWorkflowRun] });
    tick(5000);
  }));

  it('should throw error when no workflow runs found', fakeAsync(() => {
    let error: Error | undefined;

    service.downloadCv(0).subscribe({
      error: (e) => { error = e; }
    });
    tick(0);

    httpMock.expectOne((r) => r.url.includes('api.github.com')).flush({
      workflow_runs: []
    });

    expect(error).toBeTruthy();
    expect(error?.message).toContain('Failed to download CV');
  }));

  it('should throw wrapped error on HTTP failure', fakeAsync(() => {
    let error: Error | undefined;

    service.downloadCv(0).subscribe({
      error: (e) => { error = e; }
    });
    tick(0);

    httpMock.expectOne((r) => r.url.includes('api.github.com')).error(new ProgressEvent('Network error'));

    expect(error).toBeTruthy();
    expect(error?.message).toContain('Failed to download CV');
  }));

  it('should apply simulated delay before making request', fakeAsync(() => {
    let completed = false;

    service.downloadCv(500).subscribe({
      next: () => { completed = true; }
    });

    tick(100);
    httpMock.expectNone((r) => r.url.includes('api.github.com'));

    tick(400);
    httpMock.expectOne((r) => r.url.includes('api.github.com')).flush({
      workflow_runs: [mockWorkflowRun]
    });

    expect(completed).toBe(true);
    tick(5000);
  }));
});
