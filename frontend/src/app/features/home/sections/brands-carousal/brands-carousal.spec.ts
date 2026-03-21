import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsCarousal } from './brands-carousal';

describe('BrandsCarousal', () => {
  let component: BrandsCarousal;
  let fixture: ComponentFixture<BrandsCarousal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandsCarousal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandsCarousal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
