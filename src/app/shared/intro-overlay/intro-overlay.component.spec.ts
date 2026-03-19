import { PLATFORM_ID } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { jest } from '@jest/globals';

import { IntroOverlayComponent } from './intro-overlay.component';

describe('IntroOverlayComponent', () => {
  let fixture: ComponentFixture<IntroOverlayComponent>;
  let component: IntroOverlayComponent;
  let getItemSpy: ReturnType<typeof jest.spyOn>;

  const setMatchMedia = (matches: boolean): void => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })) as typeof window.matchMedia,
    });
  };

  const setupStorage = (options?: { seen?: string | null; debug?: string | null }): void => {
    const seen = options?.seen ?? null;
    const debug = options?.debug ?? null;

    getItemSpy.mockImplementation(function (this: Storage, key: string): string | null {
      if (this === window.sessionStorage && key === 'webcv.introSeen.v1') {
        return seen;
      }

      if (this === window.localStorage && key === 'webcv.intro.debug') {
        return debug;
      }

      return null;
    });
  };

  const createComponent = (): void => {
    fixture = TestBed.createComponent(IntroOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    setMatchMedia(false);

    await TestBed.configureTestingModule({
      imports: [IntroOverlayComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    setupStorage();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should skip intro when prefers-reduced-motion is true', () => {
    setMatchMedia(true);
    createComponent();

    expect(component.visible()).toBe(false);
  });

  it('should skip intro when already seen', () => {
    setupStorage({ seen: '1' });
    createComponent();

    expect(component.visible()).toBe(false);
  });

  it('should show intro when not seen and no reduced motion', () => {
    setupStorage({ seen: null, debug: null });
    createComponent();

    expect(component.visible()).toBe(true);
  });

  it('should force show when debug flag is set', () => {
    setupStorage({ seen: '1', debug: '1' });
    createComponent();

    expect(component.visible()).toBe(true);
  });

  it('should skip on keyboard shortcut when visible', () => {
    setupStorage({ seen: null, debug: null });
    createComponent();

    const event = {
      key: ' ',
      code: 'Space',
      preventDefault: jest.fn(),
    } as unknown as KeyboardEvent;

    component.onKeydown(event);
    jest.runAllTimers();

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.visible()).toBe(false);
  });

  it('should ignore keyboard shortcuts when hidden', () => {
    setupStorage({ seen: '1' });
    createComponent();

    const event = {
      key: 'Escape',
      code: 'Escape',
      preventDefault: jest.fn(),
    } as unknown as KeyboardEvent;

    component.onKeydown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(component.visible()).toBe(false);
  });

  it('should not throw on destroy', () => {
    createComponent();

    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
