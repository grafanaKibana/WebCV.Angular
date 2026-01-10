import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebGLBackgroundComponent } from './webgl-background.component';
import { WebGLGradientService } from '../../services/webgl-gradient.service';

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
      getThemeNames: jest.fn()
    } as unknown as jest.Mocked<WebGLGradientService>;
    
    // Mock the getColorScheme method
    mockWebGLGradientService.getColorScheme.mockReturnValue([[0, 0, 0], [255, 255, 255]]);
    mockWebGLGradientService.getThemeNames.mockReturnValue(['Green Teal', 'Purple Sunset', 'Ocean Blue', 'Autumn', 'Midnight']);
    
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
    expect(component.speed).toBe(0.5);
    expect(component.amplitude).toBe(0.85);
    expect(component.darkerTop).toBe(false);
    expect(component.parallax).toBe(true);
    expect(component.parallaxIntensity).toBe(0.5);
    expect(component.themeName).toBeUndefined();
  });

  it('should call applyGradient when initialized', () => {
    component.initGradient();
    expect(mockWebGLGradientService.applyGradient).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        speed: 0.5,
        amplitude: 0.85,
        darkerTop: false,
        themeName: undefined,
        parallax: true,
        parallaxIntensity: 0.5
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
