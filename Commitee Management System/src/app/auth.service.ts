import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  error?: {
    message: string;
    status?: number;
  };
}

interface SignInPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  async signUp(email: string, password: string) {
    try {
      console.log('[AuthService] Attempting signup for:', email);
      const response = await this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/register`, {
          email,
          password,
          fullName: email.split('@')[0],
        })
        .toPromise();

      console.log('[AuthService] Signup response:', response);
      if (response?.success) {
        return { data: response.data, error: null };
      }
      return { data: null, error: { message: response?.message || 'Signup failed' } };
    } catch (error) {
      const err = this.handleError(error, 'signup');
      console.error('[AuthService] Signup exception:', err);
      return { data: null, error: err };
    }
  }

  async signIn(email: string, password: string) {
    try {
      console.log('[AuthService] Attempting login for:', email);
      const response = await this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
        .toPromise();

      console.log('[AuthService] Login response:', response);
      if (response?.success && response.data) {
        // Store tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { data: response.data, error: null };
      }
      return { data: null, error: { message: response?.message || 'Login failed' } };
    } catch (error) {
      const err = this.handleError(error, 'login');
      console.error('[AuthService] Login exception:', err);
      return { data: null, error: err };
    }
  }

  signOut() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return Promise.resolve();
  }

  getUser() {
    const user = localStorage.getItem('user');
    return Promise.resolve(user ? JSON.parse(user) : null);
  }

  private handleError(error: any, context: string = 'auth'): any {
    console.error(`[AuthService] ${context} error:`, error);

    if (error instanceof HttpErrorResponse) {
      // Network error
      if (error.status === 0) {
        return {
          message: 'Unable to connect to server. Please check your connection and ensure the backend is running on port 3000.',
          status: 0,
        };
      }

      // Server error response
      if (error.error?.error?.message) {
        return {
          message: error.error.error.message,
          status: error.status,
        };
      }

      if (error.error?.message) {
        return {
          message: error.error.message,
          status: error.status,
        };
      }

      // HTTP status-specific errors
      switch (error.status) {
        case 401:
          return { message: 'Invalid email or password', status: 401 };
        case 409:
          return { message: 'This email is already registered. Please login instead.', status: 409 };
        case 400:
          return { message: 'Invalid request. Please check your input.', status: 400 };
        case 500:
          return { message: 'Server error. Please try again later.', status: 500 };
        default:
          return { message: `Error: ${error.statusText || 'Unknown error'}`, status: error.status };
      }
    }

    // Client-side error
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        return {
          message: 'CORS error. Backend and frontend are not properly configured.',
          status: 0,
        };
      }
      return { message: error.message, status: 0 };
    }

    return { message: 'An unexpected error occurred', status: 0 };
  }
}
