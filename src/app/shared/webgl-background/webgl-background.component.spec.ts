import { ComponentFixture, TestBed } from '@angular/core/testing';
import { jest } from '@jest/globals';
import { WebGLBackgroundComponent } from './webgl-background.component';
import { WebGLGradientService } from '../../services/webgl-gradient.service';
import { webglConfig } from '../../config/webgl.config';

describe('WebGLBackgroundComponent', () => {
  let component: WebGLBackgroundComponent;
  let fixture: ComponentFixture<WebGLBackgroundComponent>;
  let mockWebGLGradientService: jest.Mocked<WebGLGradientService>;

  beforeEach(async () => {
    mockWebGLGradientService = {
      applyGradient: jest.fn(),
      removeGradient: jest.fn(),
      getColorScheme: jest.fn(),
      getRandomColorScheme: jest.fn(),
      getThemeNames: jest.fn(),
      getSavedThemeName: jest.fn()
    } as unknown as jest.Mocked<WebGLGradientService>;
    
    // Mock the getColorScheme method
    mockWebGLGradientService.getColorScheme.mockReturnValue([[0, 0, 0], [255, 255, 255]]);
    mockWebGLGradientService.getThemeNames.mockReturnValue(['Green Teal', 'Purple Sunset', 'Ocean Blue', 'Autumn', 'Midnight']);
    mockWebGLGradientService.getSavedThemeName.mockReturnValue(undefined);
    
    await TestBed.configureTestingModule({
      declarations: [ WebGLBackgroundComponent ],
      providers: [
        { provide: WebGLGradientService, useValue: mockWebGLGradientService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebGLBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.speed).toBe(webglConfig.background.speed);
    expect(component.amplitude).toBe(webglConfig.background.amplitude);
    expect(component.darkerTop).toBe(webglConfig.background.darkerTop);
    expect(component.parallax).toBe(webglConfig.background.parallax);
    expect(component.parallaxIntensity).toBe(webglConfig.background.parallaxIntensity);
    expect(component.themeName).toBeUndefined();
  });

  it('should call applyGradient when initialized', () => {
    component.initGradient();
    expect(mockWebGLGradientService.applyGradient).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        speed: webglConfig.background.speed,
        amplitude: webglConfig.background.amplitude,
        darkerTop: webglConfig.background.darkerTop,
        themeName: undefined,
        parallax: webglConfig.background.parallax,
        parallaxIntensity: webglConfig.background.parallaxIntensity
      })
    );
  });

  it('should get color scheme by theme name', () => {
    component.getColorScheme('Ocean Blue');
    expect(mockWebGLGradientService.getColorScheme).toHaveBeenCalledWith('Ocean Blue');
  });

  it('should get all color schemes', () => {
    const schemes = component.getColorSchemes();
    expect(schemes.size).toBe(5);
    expect(mockWebGLGradientService.getThemeNames).toHaveBeenCalled();
    expect(mockWebGLGradientService.getColorScheme).toHaveBeenCalledTimes(5);
  });

  it('should apply specific color scheme when themeName is provided', () => {
    component.themeName = 'Ocean Blue';
    component.initGradient();
    
    expect(mockWebGLGradientService.applyGradient).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        themeName: 'Ocean Blue'
      })
    );
  });
}); 
