import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class AuthComponent {
  authForm: FormGroup;
  isLogin = true;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async submit() {
    this.errorMsg = '';
    if (this.authForm.invalid) {
      this.errorMsg = 'Please fill all required fields correctly';
      return;
    }
    this.loading = true;
    const { email, password } = this.authForm.value;
    try {
      const mode = this.isLogin ? 'login' : 'registration';
      console.log(`[AUTH] Starting ${mode} for ${email}`);
      
      if (this.isLogin) {
        const result = await this.auth.signIn(email, password);
        if (result.error) {
          console.error(`[AUTH] Login error:`, result.error);
          throw new Error(result.error.message || 'Login failed. Please try again.');
        }
        console.log(`[AUTH] Login successful for ${email}`);
      } else {
        const result = await this.auth.signUp(email, password);
        if (result.error) {
          console.error(`[AUTH] Signup error:`, result.error);
          throw new Error(result.error.message || 'Registration failed. Please try again.');
        }
        console.log(`[AUTH] Signup successful for ${email}`);
      }
    } catch (err: any) {
      console.error('[AUTH] Exception caught:', err);
      
      // Handle different error types
      if (err.message.includes('Failed to fetch')) {
        this.errorMsg = 'Network error. Please check your connection and ensure the backend is running.';
      } else if (err.message.includes('CORS')) {
        this.errorMsg = 'CORS error. Backend and frontend are not properly configured.';
      } else if (err.message.includes('Invalid email or password')) {
        this.errorMsg = 'Invalid email or password. Please try again.';
      } else if (err.message.includes('already registered')) {
        this.errorMsg = 'This email is already registered. Please login or use a different email.';
      } else {
        this.errorMsg = err.message || (this.isLogin ? 'Login failed.' : 'Registration failed.');
      }
      
      console.error(`[AUTH] ${this.isLogin ? 'Login' : 'Registration'} error message:`, this.errorMsg);
    } finally {
      this.loading = false;
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMsg = '';
  }
}
