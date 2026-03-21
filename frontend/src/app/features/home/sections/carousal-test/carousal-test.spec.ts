import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarousalTest } from './carousal-test';

describe('CarousalTest', () => {
  let component: CarousalTest;
  let fixture: ComponentFixture<CarousalTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarousalTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarousalTest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
