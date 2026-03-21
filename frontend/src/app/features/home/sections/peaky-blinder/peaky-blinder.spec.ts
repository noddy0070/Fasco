import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeakyBlinder } from './peaky-blinder';

describe('PeakyBlinder', () => {
  let component: PeakyBlinder;
  let fixture: ComponentFixture<PeakyBlinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeakyBlinder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeakyBlinder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
