import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TransitionLink } from './transition-link';

describe('TransitionLink', () => {
  let component: TransitionLink;
  let fixture: ComponentFixture<TransitionLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransitionLink],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransitionLink);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('link', '/test');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
