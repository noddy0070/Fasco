import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
