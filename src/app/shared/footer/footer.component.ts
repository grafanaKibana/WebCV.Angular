import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public currentDate = new Date().getUTCFullYear()

  sendEmail(userName: string, userEmail: string, userMessage: string): void {
    console.warn('You has been nayoban :(')
  }
}
