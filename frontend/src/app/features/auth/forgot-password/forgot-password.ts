import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFrame } from '../../../layout/auth-frame/auth-frame';
import { BlackButton } from '../../../shared/components/black-button/black-button';
import { EyeTrack } from '../../../shared/components/eye-track/eye-track';
import { AuthService } from '../auth.service';
import { emailFormatValidator } from '../../../shared/validators/email.validator';

@Component({
  selector: 'app-forgot-password',
  imports: [AuthFrame, BlackButton, EyeTrack, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  token = signal('');
  message = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);
  isEyeClosed = signal(true);
  isEyeClosed2 = signal(true);

  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, emailFormatValidator]],
  });

  resetForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.token.set(this.route.snapshot.queryParamMap.get('token') ?? '');
  }

  onSendLink(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.message.set('');
    this.isSubmitting.set(true);
    this.authService.forgotPassword(this.emailForm.getRawValue().email).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.message.set(res.message ?? 'Reset link sent successfully.');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Failed to send reset link.');
      },
    });
  }

  onResetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    if (!this.token()) {
      this.errorMessage.set('Reset token is missing.');
      return;
    }

    const { newPassword, confirmPassword } = this.resetForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.errorMessage.set('');
    this.message.set('');
    this.isSubmitting.set(true);
    this.authService.resetPassword({ token: this.token(), newPassword }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.message.set(res.message ?? 'Password reset successful.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Failed to reset password.');
      },
    });
  }
}
