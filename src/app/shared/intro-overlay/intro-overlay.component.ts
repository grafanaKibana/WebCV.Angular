import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';

@Component({
  selector: 'app-intro-overlay',
  standalone: true,
  templateUrl: './intro-overlay.component.html',
  styleUrls: ['./intro-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroOverlayComponent implements OnInit, OnDestroy {
  visible = false;
  isExiting = false;
  lineText = '';
  lineVisible = false;

  readonly introLines: string[] = ['Hi.', 'My name is Nikita.', 'I am AI Engineer'];

  private readonly seenKey = 'webcv.introSeen.v1';
  private readonly minIntroMs = 1000;
  private readonly exitMs = 700;
  private readonly lineTransitionMs = 420;

  private readonly startDelayMs = 220;
  private readonly pauseBetweenLinesMs = 2000;
  private readonly holdLastLineMs = 3000;
  private runToken = 0;
  private exitTimeoutId: number | null = null;
  private removeAnimateTimeoutId: number | null = null;
  private readonly cdr = inject(ChangeDetectorRef);

  private debugForceShow = false;

  ngOnInit(): void {
    // Safety: if index.html didn't run, make sure we don't keep prehide forever.
    const reduce = this.prefersReducedMotion();
    this.debugForceShow = this.shouldForceShow();
    const seen = this.hasSeen();

    if (reduce || (seen && !this.debugForceShow)) {
      this.removePrehideClasses();
      return;
    }

    this.visible = true;
    this.cdr.markForCheck();

    // If there is nothing to show, reveal the app immediately.
    if (this.getIntroLines().length === 0) {
      if (!this.debugForceShow) {
        this.markSeen();
      }
      this.removePrehideClasses();
      this.removeAnimateClass();
      this.visible = false;
      this.cdr.markForCheck();
      return;
    }

    void this.playIntro();
  }

  ngOnDestroy(): void {
    this.runToken++;
    if (this.exitTimeoutId !== null) {
      window.clearTimeout(this.exitTimeoutId);
      this.exitTimeoutId = null;
    }
    if (this.removeAnimateTimeoutId !== null) {
      window.clearTimeout(this.removeAnimateTimeoutId);
      this.removeAnimateTimeoutId = null;
    }
  }

  skip(): void {
    // Skip is immediate (does not wait for min intro time).
    this.beginExit(true);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent): void {
    if (!this.visible) return;
    if (ev.code === 'Space' || ev.key === ' ' || ev.key === 'Escape') {
      ev.preventDefault();
      this.skip();
    }
  }

  private async setLineWithTransition(text: string, token: number): Promise<void> {
    if (token !== this.runToken || !this.visible || this.isExiting) return;

    const first = !this.lineText;
    if (!first) {
      // Fade current line out, then swap text, then fade in.
      this.lineVisible = false;
      this.cdr.markForCheck();
      await this.sleep(this.lineTransitionMs);
      if (token !== this.runToken || !this.visible || this.isExiting) return;
    }

    this.lineText = text;
    this.cdr.markForCheck();

    // Ensure transition triggers reliably.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (token !== this.runToken || !this.visible || this.isExiting) return;

    this.lineVisible = true;
    this.cdr.markForCheck();
  }

  private beginExit(forceImmediate: boolean = false): void {
    if (!this.visible || this.isExiting) return;

    // Cancel any in-flight scripted sequence.
    this.runToken++;

    if (!this.debugForceShow) {
      this.markSeen();
    }

    this.removePrehideClasses();

    if (this.removeAnimateTimeoutId !== null) {
      window.clearTimeout(this.removeAnimateTimeoutId);
    }
    this.removeAnimateTimeoutId = window.setTimeout(() => this.removeAnimateClass(), this.exitMs + 500);

    this.isExiting = true;
    this.cdr.markForCheck();

    if (this.exitTimeoutId !== null) {
      window.clearTimeout(this.exitTimeoutId);
    }
    this.exitTimeoutId = window.setTimeout(() => {
      this.visible = false;
      this.cdr.markForCheck();
    }, forceImmediate ? 0 : this.exitMs);
  }

  private prefersReducedMotion(): boolean {
    return !!(
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)') &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private hasSeen(): boolean {
    try {
      return sessionStorage.getItem(this.seenKey) === '1';
    } catch {
      return false;
    }
  }

  private shouldForceShow(): boolean {
    try {
      const qs = new URLSearchParams(window.location.search || '');
      const p = qs.get('intro');
      if (p === '1' || p === 'true' || p === 'debug') return true;
      return localStorage.getItem('webcv.intro.debug') === '1';
    } catch {
      return false;
    }
  }

  private markSeen(): void {
    try {
      sessionStorage.setItem(this.seenKey, '1');
    } catch {
      // ignore
    }
  }

  private removePrehideClasses(): void {
    try {
      document.documentElement.classList.remove('intro-prehide');
    } catch {
      // ignore
    }
  }

  private removeAnimateClass(): void {
    try {
      document.documentElement.classList.remove('intro-animate');
    } catch {
      // ignore
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, Math.round(ms))));
  }

  private async playIntro(): Promise<void> {
    const token = ++this.runToken;
    const startedAt = performance.now();

    const lines = this.getIntroLines();
    if (lines.length === 0) {
      this.beginExit(true);
      return;
    }

    await this.sleep(this.startDelayMs);
    if (token !== this.runToken || !this.visible || this.isExiting) return;

    for (let i = 0; i < lines.length; i++) {
      await this.setLineWithTransition(lines[i], token);
      if (token !== this.runToken || !this.visible || this.isExiting) return;

      const isLast = i === lines.length - 1;
      await this.sleep(isLast ? this.holdLastLineMs : this.pauseBetweenLinesMs);
      if (token !== this.runToken || !this.visible || this.isExiting) return;
    }

    const elapsed = performance.now() - startedAt;
    if (elapsed < this.minIntroMs) {
      await this.sleep(this.minIntroMs - elapsed);
    }
    if (token !== this.runToken || !this.visible || this.isExiting) return;

    this.beginExit(false);
  }

  private getIntroLines(): string[] {
    return (this.introLines || []).map((s) => String(s || '').trim()).filter((s) => s.length > 0);
  }
}
