import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitedTimeDeal } from './limited-time-deal';

describe('LimitedTimeDeal', () => {
  let component: LimitedTimeDeal;
  let fixture: ComponentFixture<LimitedTimeDeal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LimitedTimeDeal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitedTimeDeal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
