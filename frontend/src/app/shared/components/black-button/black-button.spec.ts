import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackButton } from './black-button';

describe('BlackButton', () => {
  let component: BlackButton;
  let fixture: ComponentFixture<BlackButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlackButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlackButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
