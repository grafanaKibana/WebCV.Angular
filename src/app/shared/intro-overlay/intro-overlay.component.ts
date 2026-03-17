import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Observable, Subject, EMPTY, concat, timer, defer, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  private readonly cancel$ = new Subject<void>();
  private exitTimeoutId: number | null = null;
  private removeAnimateTimeoutId: number | null = null;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  private debugForceShow = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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

    this.playIntro();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.cancel$.next();
    this.cancel$.complete();
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

  private setLineWithTransition$(text: string): Observable<unknown> {
    return defer(() => {
      if (!this.visible || this.isExiting) return EMPTY;

      const steps: Observable<unknown>[] = [];

      if (this.lineText) {
        steps.push(defer(() => {
          this.lineVisible = false;
          this.cdr.markForCheck();
          return timer(this.lineTransitionMs);
        }));
      }

      steps.push(defer(() => {
        if (!this.visible || this.isExiting) return EMPTY;
        this.lineText = text;
        this.cdr.markForCheck();
        return this.animationFrame$();
      }));

      steps.push(defer(() => {
        if (!this.visible || this.isExiting) return EMPTY;
        this.lineVisible = true;
        this.cdr.markForCheck();
        return of(undefined);
      }));

      return concat(...steps);
    });
  }

  private beginExit(forceImmediate: boolean = false): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.visible || this.isExiting) return;

    // Set flag before cancelling so the complete handler sees isExiting = true
    this.isExiting = true;
    this.cancel$.next();

    if (!this.debugForceShow) {
      this.markSeen();
    }

    this.removePrehideClasses();

    if (this.removeAnimateTimeoutId !== null) {
      window.clearTimeout(this.removeAnimateTimeoutId);
    }
    this.removeAnimateTimeoutId = window.setTimeout(() => this.removeAnimateClass(), this.exitMs + 500);

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
    if (!isPlatformBrowser(this.platformId)) return false;

    return !!(
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)') &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private hasSeen(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    try {
      return sessionStorage.getItem(this.seenKey) === '1';
    } catch {
      return false;
    }
  }

  private shouldForceShow(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

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
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      sessionStorage.setItem(this.seenKey, '1');
    } catch {
      // ignore
    }
  }

  private removePrehideClasses(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      document.documentElement.classList.remove('intro-prehide');
    } catch {
      // ignore
    }
  }

  private removeAnimateClass(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      document.documentElement.classList.remove('intro-animate');
    } catch {
      // ignore
    }
  }

  /**
   * Wraps requestAnimationFrame as a single-emission Observable.
   */
  private animationFrame$(): Observable<void> {
    return new Observable<void>(subscriber => {
      const id = requestAnimationFrame(() => {
        subscriber.next();
        subscriber.complete();
      });
      return () => cancelAnimationFrame(id);
    });
  }

  private playIntro(): void {
    this.cancel$.next();

    const startedAt = performance.now();
    const lines = this.getIntroLines();

    if (lines.length === 0) {
      this.beginExit(true);
      return;
    }

    const steps: Observable<unknown>[] = [timer(this.startDelayMs)];

    for (let i = 0; i < lines.length; i++) {
      steps.push(this.setLineWithTransition$(lines[i]));
      const isLast = i === lines.length - 1;
      steps.push(timer(isLast ? this.holdLastLineMs : this.pauseBetweenLinesMs));
    }

    steps.push(defer(() => {
      const elapsed = performance.now() - startedAt;
      const remaining = this.minIntroMs - elapsed;
      return remaining > 0 ? timer(remaining) : EMPTY;
    }));

    concat(...steps).pipe(
      takeUntil(this.cancel$)
    ).subscribe({
      complete: () => {
        if (this.visible && !this.isExiting) this.beginExit(false);
      }
    });
  }

  private getIntroLines(): string[] {
    return (this.introLines || []).map((s) => String(s || '').trim()).filter((s) => s.length > 0);
  }
}
