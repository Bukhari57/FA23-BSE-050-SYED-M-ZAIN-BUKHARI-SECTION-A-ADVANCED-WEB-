import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { LoginPayload, RegisterPayload, User } from '../models/auth.model';

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly api: ApiClientService) {}

  register(payload: RegisterPayload): Observable<string> {
    return this.api
      .post<never>('/auth/register', payload)
      .pipe(map((response) => response.message ?? 'Registration completed'));
  }

  verifyEmail(token: string): Observable<string> {
    return this.api
      .post<never>('/auth/verify-email', { token })
      .pipe(map((response) => response.message ?? 'Email verified'));
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', payload).pipe(map((response) => response.data));
  }

  refresh(refreshToken: string): Observable<{ accessToken: string }> {
    return this.api
      .post<{ accessToken: string }>('/auth/refresh', { refreshToken })
      .pipe(map((response) => response.data));
  }

  me(): Observable<User> {
    return this.api.get<User>('/auth/me').pipe(map((response) => response.data));
  }

  forgotPassword(email: string): Observable<string> {
    return this.api
      .post<never>('/auth/forgot-password', { email })
      .pipe(map((response) => response.message ?? 'Reset email sent'));
  }

  resetPassword(token: string, password: string): Observable<string> {
    return this.api
      .post<never>('/auth/reset-password', { token, password })
      .pipe(map((response) => response.message ?? 'Password updated'));
  }

  logout(refreshToken: string): Observable<string> {
    return this.api
      .post<never>('/auth/logout', { refreshToken })
      .pipe(map((response) => response.message ?? 'Logged out'));
  }
}
