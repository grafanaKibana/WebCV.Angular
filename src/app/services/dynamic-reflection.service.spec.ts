import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { jest } from '@jest/globals';
import { DynamicReflectionService } from './dynamic-reflection.service';

describe('DynamicReflectionService', () => {
  let service: DynamicReflectionService;
  let setPropertySpy: jest.SpiedFunction<CSSStyleDeclaration['setProperty']>;
  let removePropertySpy: jest.SpiedFunction<CSSStyleDeclaration['removeProperty']>;
  let rafSpy: jest.SpiedFunction<typeof window.requestAnimationFrame>;
  let now = 1000;
  let rafCallback: FrameRequestCallback | null = null;
  let rafId = 0;

  const reflectionCssVars = ['--reflection-r', '--reflection-g', '--reflection-b'];

  const flushRaf = (): void => {
    if (rafCallback) {
      const callback = rafCallback;
      rafCallback = null;
      callback(now);
    }
  };

  const advanceTime = (ms: number): void => {
    now += ms;
  };

  const getSetPropertyCalls = (): Array<[string, string]> => (
    setPropertySpy.mock.calls as Array<[string, string]>
  );

  beforeEach(() => {
    jest.spyOn(performance, 'now').mockImplementation(() => now);

    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb;
      rafId += 1;
      return rafId;
    });

    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');
    removePropertySpy = jest.spyOn(document.documentElement.style, 'removeProperty');

    TestBed.configureTestingModule({
      providers: [
        DynamicReflectionService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(DynamicReflectionService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    rafCallback = null;
    rafId = 0;
    now = 1000;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set reflection CSS variables on valid color update', () => {
    advanceTime(200);
    service.updateReflectionColors([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0]]);

    expect(rafSpy).toHaveBeenCalledTimes(1);
    flushRaf();

    const setCalls = getSetPropertyCalls().map(([name]) => name);
    expect(setCalls).toEqual(expect.arrayContaining(reflectionCssVars));
  });

  it('should handle empty colors array without scheduling style updates', () => {
    advanceTime(200);

    expect(() => service.updateReflectionColors([])).not.toThrow();
    flushRaf();

    expect(rafSpy).not.toHaveBeenCalled();
    expect(setPropertySpy).not.toHaveBeenCalled();
  });

  it('should handle single color and apply all reflection vars', () => {
    advanceTime(200);
    service.updateReflectionColors([[128, 64, 32]]);
    flushRaf();

    const names = getSetPropertyCalls().map(([name]) => name);
    expect(names).toEqual(expect.arrayContaining(reflectionCssVars));
  });

  it('should produce different CSS values for distinct color inputs', () => {
    advanceTime(200);
    service.updateReflectionColors([[255, 0, 0], [255, 0, 0], [255, 0, 0], [255, 0, 0]]);
    flushRaf();
    const firstValues = getSetPropertyCalls().map(([, value]) => value);

    setPropertySpy.mockClear();
    advanceTime(200);
    service.updateReflectionColors([[0, 0, 255], [0, 0, 255], [0, 0, 255], [0, 0, 255]]);
    flushRaf();
    const secondValues = getSetPropertyCalls().map(([, value]) => value);

    expect(firstValues.length).toBeGreaterThan(0);
    expect(secondValues.length).toBeGreaterThan(0);
    expect(firstValues).not.toEqual(secondValues);
  });

  it('should throttle frequent updates according to configured timing', () => {
    advanceTime(200);
    service.updateReflectionColors([[10, 20, 30], [30, 40, 50]]);

    advanceTime(50);
    service.updateReflectionColors([[200, 220, 240], [240, 220, 200]]);

    expect(rafSpy).toHaveBeenCalledTimes(1);
    flushRaf();

    expect(getSetPropertyCalls()).toHaveLength(3);
  });

  it('should not schedule a second RAF while one is pending', () => {
    advanceTime(200);
    service.updateReflectionColors([[120, 100, 80], [80, 100, 120]]);
    advanceTime(200);
    service.updateReflectionColors([[200, 160, 120], [140, 180, 220]]);

    expect(rafSpy).toHaveBeenCalledTimes(1);
    flushRaf();
    expect(setPropertySpy).toHaveBeenCalled();
  });

  it('should call cancelAnimationFrame and remove CSS vars on destroy with pending frame', () => {
    advanceTime(200);
    service.updateReflectionColors([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0]]);

    service.destroy();

    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(removePropertySpy).toHaveBeenCalledWith('--reflection-r');
    expect(removePropertySpy).toHaveBeenCalledWith('--reflection-g');
    expect(removePropertySpy).toHaveBeenCalledWith('--reflection-b');
    expect(removePropertySpy).toHaveBeenCalledWith('--reflection-angle');
  });

  it('should not throw when applyLastReflection is called before any update', () => {
    expect(() => service.applyLastReflection()).not.toThrow();
    expect(setPropertySpy).not.toHaveBeenCalled();
  });

  it('should re-apply last reflection values when applyLastReflection is called after update', () => {
    advanceTime(200);
    service.updateReflectionColors([[200, 100, 50], [150, 80, 30], [180, 90, 40], [160, 70, 20]]);
    flushRaf();

    setPropertySpy.mockClear();
    service.applyLastReflection();

    const names = getSetPropertyCalls().map(([name]) => name);
    expect(names).toEqual(expect.arrayContaining(reflectionCssVars));
  });

  it('should not apply CSS vars after destroy then applyLastReflection', () => {
    advanceTime(200);
    service.updateReflectionColors([[200, 100, 50], [150, 80, 30], [180, 90, 40], [160, 70, 20]]);
    flushRaf();

    service.destroy();
    setPropertySpy.mockClear();
    service.applyLastReflection();

    expect(setPropertySpy).not.toHaveBeenCalled();
  });
});
