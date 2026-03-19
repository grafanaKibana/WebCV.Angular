import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalSeparatorComponent } from './horizontal-separator.component';

describe('HorizontalSeparatorComponent', () => {
  let component: HorizontalSeparatorComponent;
  let fixture: ComponentFixture<HorizontalSeparatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalSeparatorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HorizontalSeparatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a div element inside the component', () => {
    expect(fixture.nativeElement.querySelector('div')).toBeTruthy();
  });

  it('should render with exactly one inner element', () => {
    expect(fixture.nativeElement.children.length).toBe(1);
  });
});
