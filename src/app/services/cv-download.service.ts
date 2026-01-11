import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

interface WorkflowRun {
  id: number;
  status: string;
  conclusion: string;
  head_branch: string;
  created_at: string;
}

interface WorkflowRunsResponse {
  workflow_runs: WorkflowRun[];
}

/**
 * Service for downloading CV PDF from GitHub Actions workflow artifacts
 */
@Injectable({
  providedIn: 'root'
})
export class CvDownloadService {
  private readonly owner = 'grafanaKibana';
  private readonly repo = 'LatexCV';
  private readonly workflowFileName = 'main.yml';
  private readonly artifactName = 'cv-pdf';
  private readonly apiBaseUrl = 'https://api.github.com';

  constructor(private http: HttpClient) {}

  /**
   * Downloads the CV PDF from the latest successful master workflow run
   * Uses nightly.link to download the artifact directly via iframe
   */
  downloadCv(): Observable<void> {
    return this.getLatestSuccessfulMasterRun().pipe(
      tap(run => {
        const downloadUrl = `https://nightly.link/${this.owner}/${this.repo}/actions/runs/${run.id}/${this.artifactName}.zip`;
        
        // Trigger download using an invisible iframe to avoid CORS issues
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = downloadUrl;
        document.body.appendChild(iframe);
        
        // Clean up the iframe after download starts
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 5000);
      }),
      map(() => undefined),
      catchError(error => {
        console.error('Error downloading CV:', error);
        return throwError(() => new Error('Failed to download CV. Please try again later.'));
      })
    );
  }

  /**
   * Gets the latest successful workflow run on master branch
   */
  private getLatestSuccessfulMasterRun(): Observable<WorkflowRun> {
    const url = `${this.apiBaseUrl}/repos/${this.owner}/${this.repo}/actions/workflows/${this.workflowFileName}/runs`;
    const params = {
      branch: 'master',
      status: 'success',
      per_page: '1'
    };

    return this.http.get<WorkflowRunsResponse>(url, { params }).pipe(
      map(response => {
        if (!response.workflow_runs || response.workflow_runs.length === 0) {
          throw new Error('No successful workflow runs found on master branch');
        }
        return response.workflow_runs[0];
      })
    );
  }
}
