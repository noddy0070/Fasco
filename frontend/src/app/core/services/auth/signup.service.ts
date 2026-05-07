import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../api/api.endpoints';
import type { SignupRequest, SignupResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private readonly httpClient = inject(HttpClient);

  signup(payload: SignupRequest): Observable<SignupResponse> {
    return this.httpClient.post<SignupResponse>(API_ENDPOINTS.auth.signup, payload);
  }
}