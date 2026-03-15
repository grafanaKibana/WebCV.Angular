import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

export type CopyState = 'idle' | 'success' | 'error';

@Component({
  selector: 'app-copy-button',
  templateUrl: './copy-button.component.html',
  styleUrls: ['./copy-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyButtonComponent implements OnDestroy {
  /** Text to copy to clipboard */
  @Input() text = '';

  /** Icon class for idle state */
  @Input() idleIcon = 'fa-regular fa-copy';

  /** Icon class for success state */
  @Input() successIcon = 'fa-solid fa-check';

  /** Icon class for error state (optional) */
  @Input() errorIcon = 'fa-solid fa-xmark';

  /** Accessible label for idle state */
  @Input() idleLabel = 'Copy';

  /** Accessible label for success state */
  @Input() successLabel = 'Copied!';

  /** Accessible label for error state */
  @Input() errorLabel = 'Copy failed';

  /** Duration to show success/error state (ms) */
  @Input() feedbackDuration = 2000;

  /** Additional CSS classes for the button */
  @Input() buttonClass = '';

  /** Emits when copy succeeds */
  @Output() copied = new EventEmitter<string>();

  /** Emits when copy fails */
  @Output() copyError = new EventEmitter<Error>();

  state: CopyState = 'idle';
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor(private cdr: ChangeDetectorRef) {}

  get currentLabel(): string {
    switch (this.state) {
      case 'success':
        return this.successLabel;
      case 'error':
        return this.errorLabel;
      default:
        return this.idleLabel;
    }
  }

  async copy(): Promise<void> {
    // Prevent rapid re-clicks during feedback
    if (this.state !== 'idle') return;

    if (!navigator?.clipboard) {
      this.handleError(new Error('Clipboard API not supported'));
      return;
    }

    try {
      await navigator.clipboard.writeText(this.text);
      this.handleSuccess();
    } catch (err) {
      this.handleError(err as Error);
    }
  }

  private handleSuccess(): void {
    this.state = 'success';
    this.copied.emit(this.text);
    this.scheduleReset();
    this.cdr.markForCheck();
  }

  private handleError(error: Error): void {
    this.state = 'error';
    this.copyError.emit(error);
    this.scheduleReset();
    this.cdr.markForCheck();
  }

  private scheduleReset(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.state = 'idle';
      this.cdr.markForCheck();
    }, this.feedbackDuration);
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
