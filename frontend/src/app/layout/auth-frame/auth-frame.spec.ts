import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFrame } from './auth-frame';

describe('AuthFrame', () => {
  let component: AuthFrame;
  let fixture: ComponentFixture<AuthFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFrame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthFrame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
