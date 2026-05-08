import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthFrame } from '../../../layout/auth-frame/auth-frame';
import { BlackButton } from '../../../shared/components/black-button/black-button';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-signup-verification',
  imports: [AuthFrame, BlackButton],
  templateUrl: './signup-verification.html',
  styleUrl: './signup-verification.css',
})
export class SignupVerification implements OnInit, OnDestroy {
  token = signal('');
  email = signal('');
  isVerified = signal(false);
  verifyMessage = signal('');
  isResending = signal(false);
  resendMessage = signal('');
  cooldown = signal(0);
  private cooldownInterval?: ReturnType<typeof setInterval>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    this.token.set(token || '');
    this.email.set(email || '');

    if (token) {
      this.authService.verifyEmail(token).subscribe({
        next: (response) => {
          this.isVerified.set(true);
          this.verifyMessage.set(response.message || 'Email verified successfully.');
        },
        error: (err) => {
          this.isVerified.set(false);
          this.verifyMessage.set(err?.error?.message ?? 'Verification link is invalid or expired.');
        },
      });
    }
  }

  resendLink(): void {
    if (!this.email() || this.isResending() || this.cooldown() > 0) {
      return;
    }

    this.isResending.set(true);
    this.resendMessage.set('');
    this.authService.resendVerification(this.email()).subscribe({
      next: (response) => {
        this.isResending.set(false);
        this.resendMessage.set(response.message ?? 'Verification email sent.');
        this.startCooldown(30);
      },
      error: (err) => {
        this.isResending.set(false);
        this.resendMessage.set(err?.error?.message ?? 'Failed to resend verification email.');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  private startCooldown(seconds: number): void {
    this.cooldown.set(seconds);
    this.cooldownInterval = setInterval(() => {
      const next = this.cooldown() - 1;
      this.cooldown.set(next);
      if (next <= 0 && this.cooldownInterval) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }
}
