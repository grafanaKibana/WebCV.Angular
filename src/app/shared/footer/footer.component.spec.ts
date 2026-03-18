import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have currentDate set to current UTC year', () => {
    expect(component.currentDate).toBe(new Date().getUTCFullYear());
  });

  it('should not throw when sendEmail is called', () => {
    expect(() => component.sendEmail('user', 'email@test.com', 'message')).not.toThrow();
  });
});
