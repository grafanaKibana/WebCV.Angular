import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { type AboutMeData, HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-about-me-section',
  standalone: true,
  templateUrl: './about-me-section.component.html',
  styleUrls: ['./about-me-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutMeSectionComponent {
  readonly aboutMe = toSignal(
    inject(HomeDataService).getAboutMe().pipe(
      catchError((error) => {
        console.error('Error loading about me data:', error);
        return of({ content: '' } as AboutMeData);
      })
    ),
    { initialValue: { content: '' } as AboutMeData }
  );
}
