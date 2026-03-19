import { TestBed } from '@angular/core/testing';
import { jest } from '@jest/globals';
import { webglConfig } from '../config/webgl.config';
import { WebGLGradientService } from './webgl-gradient.service';

describe('WebGLGradientService', () => {
  let service: WebGLGradientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebGLGradientService);
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get a valid color scheme by index', () => {
    const scheme0 = service.getColorScheme('Deep Purple');
    expect(scheme0).toBeTruthy();
    expect(scheme0.length).toBe(4);
    expect(scheme0[0].length).toBe(3);

    const scheme3 = service.getColorScheme('Emerald Forest');
    expect(scheme3).toBeTruthy();
    expect(scheme3.length).toBe(4);
  });

  it('should return the default scheme for invalid indices', () => {
    const defaultScheme = service.getColorScheme(service.getDefaultThemeName());
    const invalidScheme = service.getColorScheme('Invalid Theme');
    expect(invalidScheme).toEqual(defaultScheme);
  });

  it('should list theme names from configuration', () => {
    expect(service.getThemeNames()).toEqual(
      webglConfig.background.colorSchemes.map((scheme) => scheme.name)
    );
  });

  it('should cycle to the next theme and wrap around', () => {
    const names = service.getThemeNames();
    const first = names[0];
    const second = names[1];
    const last = names[names.length - 1];

    expect(service.getNextThemeName(first)).toBe(second);
    expect(service.getNextThemeName(last)).toBe(first);
  });

  it('should resolve unknown current theme before returning the next theme', () => {
    const names = service.getThemeNames();
    const defaultTheme = service.getDefaultThemeName();
    const base = names.includes(defaultTheme) ? defaultTheme : names[0];
    const expected = names[(names.indexOf(base) + 1) % names.length];

    expect(service.getNextThemeName('Unknown Theme')).toBe(expected);
  });

  it('should save theme name to localStorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    service.saveThemeName('Ocean Blue');

    expect(setItemSpy).toHaveBeenCalledWith('webcv.themeName.v1', 'Ocean Blue');
  });

  it('should read a valid saved theme name from localStorage', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('Ocean Blue');

    expect(service.getSavedThemeName()).toBe('Ocean Blue');
  });

  it('should ignore an invalid saved theme name from localStorage', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('Invalid Theme');

    expect(service.getSavedThemeName()).toBeUndefined();
  });

  it('should return the configured color scheme by name', () => {
    const expected = webglConfig.background.colorSchemes.find(
      (scheme) => scheme.name === 'Ocean Blue'
    )?.colors;

    expect(service.getColorScheme('Ocean Blue')).toEqual(expected);
  });

  it('should set accent CSS variables for the selected theme', () => {
    const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

    service.applyAccentColor('Ocean Blue');

    expect(setPropertySpy).toHaveBeenCalledWith('--accent-r', '100');
    expect(setPropertySpy).toHaveBeenCalledWith('--accent-g', '216');
    expect(setPropertySpy).toHaveBeenCalledWith('--accent-b', '255');
  });

  it('should apply CSS fallback when WebGL is unavailable', () => {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const container = document.createElement('div');

    expect(() => service.applyGradient(container, { themeName: 'Ocean Blue' })).not.toThrow();
    expect(container.getAttribute('data-gradient-id')).toContain('gradient-');
    expect(container.style.animation).toContain('gradientShift');
  });

  it('should not throw when removing gradient from container without gradient', () => {
    const container = document.createElement('div');

    expect(() => service.removeGradient(container)).not.toThrow();
  });
});
