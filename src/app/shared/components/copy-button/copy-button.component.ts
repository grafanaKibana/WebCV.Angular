import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  PLATFORM_ID,
  inject,
  input,
  signal,
  output
} from '@angular/core';
import { from } from 'rxjs';

export type CopyState = 'idle' | 'success' | 'error';

@Component({
  selector: 'app-copy-button',
  standalone: true,
  templateUrl: './copy-button.component.html',
  styleUrls: ['./copy-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyButtonComponent {
  /** Text to copy to clipboard */
  readonly text = input('');

  /** Icon class for idle state */
  readonly idleIcon = input('fa-regular fa-copy');

  /** Icon class for success state */
  readonly successIcon = input('fa-solid fa-check');

  /** Icon class for error state (optional) */
  readonly errorIcon = input('fa-solid fa-xmark');

  /** Accessible label for idle state */
  readonly idleLabel = input('Copy');

  /** Accessible label for success state */
  readonly successLabel = input('Copied!');

  /** Accessible label for error state */
  readonly errorLabel = input('Copy failed');

  /** Duration to show success/error state (ms) */
  readonly feedbackDuration = input(2000);

  /** Additional CSS classes for the button */
  readonly buttonClass = input('');

  /** Emits when copy succeeds */
  readonly copied = output<string>();

  /** Emits when copy fails */
  readonly copyError = output<Error>();

  readonly state = signal<CopyState>('idle');
  private timeoutId?: ReturnType<typeof setTimeout>;
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
    });
  }

  get currentLabel(): string {
    switch (this.state()) {
      case 'success':
        return this.successLabel();
      case 'error':
        return this.errorLabel();
      default:
        return this.idleLabel();
    }
  }

  copy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.handleError(new Error('Clipboard API not supported'));
      return;
    }

    // Prevent rapid re-clicks during feedback
    if (this.state() !== 'idle') return;

    if (!navigator?.clipboard) {
      this.handleError(new Error('Clipboard API not supported'));
      return;
    }

    from(navigator.clipboard.writeText(this.text())).subscribe({
      next: () => this.handleSuccess(),
      error: (err: Error) => this.handleError(err)
    });
  }

  private handleSuccess(): void {
    this.state.set('success');
    this.copied.emit(this.text());
    this.scheduleReset();
  }

  private handleError(error: Error): void {
    this.state.set('error');
    this.copyError.emit(error);
    this.scheduleReset();
  }

  private scheduleReset(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.state.set('idle');
    }, this.feedbackDuration());
  }
}
