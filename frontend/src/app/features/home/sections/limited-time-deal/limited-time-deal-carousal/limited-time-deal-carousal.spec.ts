import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitedTimeDealCarousal } from './limited-time-deal-carousal';

describe('LimitedTimeDealCarousal', () => {
  let component: LimitedTimeDealCarousal;
  let fixture: ComponentFixture<LimitedTimeDealCarousal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LimitedTimeDealCarousal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitedTimeDealCarousal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
