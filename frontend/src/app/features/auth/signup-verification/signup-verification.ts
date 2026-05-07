import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthFrame } from "../../../layout/auth-frame/auth-frame";
import { BlackButton } from "../../../shared/components/black-button/black-button";
import { ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '../../../core/api/api.endpoints';
@Component({
  selector: 'app-signup-verification',
  imports: [AuthFrame, BlackButton],
  templateUrl: './signup-verification.html',
  styleUrl: './signup-verification.css',
})
export class SignupVerification implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly httpClient = inject(HttpClient);

  token = signal('');
  isVerifying = signal(false);
  isVerified = signal(false);
  message = signal('');

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.token.set(token || '');

    if (!token) {
      this.message.set('Please check your email for the verification link.');
      return;
    }

    this.isVerifying.set(true);
    this.message.set('Verifying your email...');

    this.httpClient.get<{ message: string }>(API_ENDPOINTS.auth.verifyEmail(token)).subscribe({
      next: (response) => {
        this.isVerified.set(true);
        this.message.set(response.message);
        this.isVerifying.set(false);
      },
      error: (error) => {
        this.isVerified.set(false);
        this.message.set(error?.error?.message ?? 'Email verification failed.');
        this.isVerifying.set(false);
      },
    });
  }
}
