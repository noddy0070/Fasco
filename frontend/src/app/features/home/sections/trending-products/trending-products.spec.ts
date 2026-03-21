import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingProducts } from './trending-products';

describe('TrendingProducts', () => {
  let component: TrendingProducts;
  let fixture: ComponentFixture<TrendingProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
