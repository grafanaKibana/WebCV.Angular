import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vertical-separator',
  standalone: true,
  templateUrl: './vertical-separator.component.html',
  styleUrls: ['./vertical-separator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalSeparatorComponent {
}
