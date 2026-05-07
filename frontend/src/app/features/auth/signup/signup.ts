import { Component, signal } from '@angular/core';
import { TransitionLink } from '../../../shared/components/transition-link/transition-link';
import { BlackButton } from '../../../shared/components/black-button/black-button';
import { AuthFrame } from '../../../layout/auth-frame/auth-frame';
import { EyeTrack } from '../../../shared/components/eye-track/eye-track';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [TransitionLink, BlackButton, AuthFrame, EyeTrack, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  isEyeClosed = signal(true);
  isEyeClosed2 = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...payload } = this.form.getRawValue();
    if (payload.password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);
    this.authService.signup(payload).subscribe({
      next: () => this.isSubmitting.set(false),
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Signup failed. Please try again.');
      },
    });
  }
}
