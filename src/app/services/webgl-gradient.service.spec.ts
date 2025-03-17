  import { TestBed } from '@angular/core/testing';
  import { WebGLGradientService } from './webgl-gradient.service';

  describe('WebGLGradientService', () => {
    let service: WebGLGradientService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(WebGLGradientService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should get a valid color scheme by index', () => {
      // Get the first color scheme
      const scheme0 = service.getColorScheme('Green Teal');
      expect(scheme0).toBeTruthy();
      expect(scheme0.length).toBe(4); // Each scheme has 4 colors
      expect(scheme0[0].length).toBe(3); // Each color has 3 components (RGB)
      
      // Get the fourth color scheme
      const scheme3 = service.getColorScheme('Midnight');
      expect(scheme3).toBeTruthy();
      expect(scheme3.length).toBe(4);
    });

    it('should return the default scheme for invalid indices', () => {
      const defaultScheme = service.getColorScheme('Green Teal');
      const invalidScheme = service.getColorScheme('Invalid Theme');
      expect(invalidScheme).toEqual(defaultScheme);
    });

    it('should get a random color scheme', () => {
      const randomScheme = service.getRandomColorScheme();
      expect(randomScheme).toBeTruthy();
      expect(randomScheme.length).toBe(4);
      expect(randomScheme[0].length).toBe(3);
    });
  }); 