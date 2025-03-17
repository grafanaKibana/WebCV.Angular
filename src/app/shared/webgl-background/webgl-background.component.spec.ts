import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebGLBackgroundComponent } from './webgl-background.component';
import { WebGLGradientService } from '../../services/webgl-gradient.service';

describe('WebGLBackgroundComponent', () => {
  let component: WebGLBackgroundComponent;
  let fixture: ComponentFixture<WebGLBackgroundComponent>;
  let mockWebGLGradientService: jasmine.SpyObj<WebGLGradientService>;

  beforeEach(async () => {
    // Create a mock WebGLGradientService
    mockWebGLGradientService = jasmine.createSpyObj('WebGLGradientService', [
      'applyGradient', 
      'removeGradient',
      'getColorScheme',
      'getRandomColorScheme',
      'getThemeNames'
    ]);
    
    // Mock the getColorScheme method
    mockWebGLGradientService.getColorScheme.and.returnValue([[0, 0, 0], [255, 255, 255]]);
    mockWebGLGradientService.getThemeNames.and.returnValue(['Green Teal', 'Purple Sunset', 'Ocean Blue', 'Autumn', 'Midnight']);
    
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
    expect(component.amplitude).toBe(0.2);
    expect(component.darkerTop).toBe(false);
    expect(component.parallax).toBe(true);
    expect(component.parallaxIntensity).toBe(0.5);
    expect(component.colors).toBeUndefined();
    expect(component.themeName).toBeUndefined();
  });

  it('should call applyGradient when initialized', () => {
    expect(mockWebGLGradientService.applyGradient).toHaveBeenCalledWith(
      jasmine.any(HTMLElement),
      {
        speed: 0.5,
        amplitude: 0.2,
        darkerTop: false,
        colors: undefined,
        themeName: undefined,
        parallax: true,
        parallaxIntensity: 0.5
      }
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
    component.ngOnInit();
    
    expect(mockWebGLGradientService.applyGradient).toHaveBeenCalledWith(
      jasmine.any(HTMLElement),
      jasmine.objectContaining({
        themeName: 'Ocean Blue'
      })
    );
  });
}); 