import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { EyeTrack } from './eye-track';

describe('EyeTrack', () => {
  let component: EyeTrack;
  let fixture: ComponentFixture<EyeTrack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EyeTrack]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EyeTrack);
    component = fixture.componentInstance;
    component.isEyeClosed = signal(false);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
