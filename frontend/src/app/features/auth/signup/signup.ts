import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { TransitionLink } from "../../../shared/components/transition-link/transition-link";
import { BlackButton } from "../../../shared/components/black-button/black-button";
import { AuthFrame } from "../../../layout/auth-frame/auth-frame";
import { EyeTrack } from "../../../shared/components/eye-track/eye-track";
import { SignupService } from '../../../core/services/auth/signup.service';
import { UserStore } from '../../../core/store/user-store';

@Component({
  selector: 'app-signup',
  imports: [TransitionLink, BlackButton, AuthFrame, EyeTrack, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private readonly signupService = inject(SignupService);
  private readonly userStore = inject(UserStore);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  isEyeClosed = signal(true);
  isEyeClosed2 = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  signupForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  submit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.errorMessage.set('Please complete all required fields.');
      return;
    }

    const formValue = this.signupForm.getRawValue();

    if (formValue.password !== formValue.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { confirmPassword, ...signupPayload } = formValue;

    this.signupService
      .signup(signupPayload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.userStore.setAuthState(response);
          this.successMessage.set(response.message);
          this.signupForm.reset();
          this.isEyeClosed.set(true);
          this.isEyeClosed2.set(true);
          this.router.navigate(['/signup/verification']);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message ?? 'Signup failed. Please try again.');
        },
      });
  }

}
