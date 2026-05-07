import { Component, inject, signal } from '@angular/core';
import { BlackButton } from '../../../shared/components/black-button/black-button';
import { TransitionLink } from '../../../shared/components/transition-link/transition-link';
import { AuthFrame } from '../../../layout/auth-frame/auth-frame';
import { EyeTrack } from '../../../shared/components/eye-track/eye-track';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserStore } from '../../../core/store/user-store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [BlackButton, TransitionLink, AuthFrame, EyeTrack, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isEyeClosed = signal(true);

  errorMessage = signal('');
  store = inject(UserStore);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    const ok = await this.store.login(this.form.getRawValue());
    if (ok) {
      await this.router.navigate(['/']);
      return;
    }

    this.errorMessage.set('Login failed. Please check your credentials.');
  }
}
