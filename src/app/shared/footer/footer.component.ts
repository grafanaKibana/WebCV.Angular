import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  public currentDate = new Date().getUTCFullYear()

  sendEmail(userName: string, userEmail: string, userMessage: string): void {
    console.warn('You has been nayoban :(')
  }
}
