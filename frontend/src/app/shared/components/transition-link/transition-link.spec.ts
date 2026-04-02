import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitionLink } from './transition-link';

describe('TransitionLink', () => {
  let component: TransitionLink;
  let fixture: ComponentFixture<TransitionLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransitionLink]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransitionLink);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
