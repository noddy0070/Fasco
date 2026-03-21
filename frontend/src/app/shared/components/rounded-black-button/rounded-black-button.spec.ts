import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundedBlackButton } from './rounded-black-button';

describe('RoundedBlackButton', () => {
  let component: RoundedBlackButton;
  let fixture: ComponentFixture<RoundedBlackButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundedBlackButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundedBlackButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
