import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <section class="page hero">
      <div class="hero-main">
        <span class="eyebrow">Rotating savings made trackable</span>
        <h1>Run trusted committees without spreadsheet chaos.</h1>
        <p>Invite members, track monthly payments, manage turn order, and keep a clean payment record from one Supabase-backed dashboard.</p>
      </div>

      <div class="panel">
        <div class="section-head">
          <h2>{{ mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password' }}</h2>
          <button class="link-button" type="button" (click)="toggleMode()">
            {{ mode === 'login' ? 'Sign up' : 'Login' }}
          </button>
        </div>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="field" *ngIf="mode === 'signup'">
            <label for="fullName">Full name</label>
            <input id="fullName" formControlName="fullName" autocomplete="name">
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email">
          </div>
          <div class="field" *ngIf="mode !== 'forgot'">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="current-password">
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="badge" *ngIf="message">{{ message }}</p>
          <button class="btn" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Please wait...' : mode === 'forgot' ? 'Send reset link' : mode === 'signup' ? 'Create account' : 'Login' }}
          </button>
          <button class="link-button" type="button" (click)="mode = 'forgot'; error = ''; message = ''">
            Forgot password?
          </button>
        </form>
      </div>
    </section>
  `
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  mode: 'login' | 'signup' | 'forgot' = 'login';
  loading = false;
  error = '';
  message = '';

  readonly form = this.fb.nonNullable.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]]
  });

  toggleMode() {
    this.mode = this.mode === 'login' ? 'signup' : 'login';
    this.error = '';
    this.message = '';
  }

  async submit() {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    try {
      const { fullName, email, password } = this.form.getRawValue();
      if (this.mode === 'signup') {
        await this.auth.signup(fullName || email.split('@')[0], email, password);
        this.message = 'Check your email if confirmation is enabled, then log in.';
        this.mode = 'login';
      } else if (this.mode === 'forgot') {
        await this.auth.forgotPassword(email);
        this.message = 'Password reset link sent.';
      } else {
        await this.auth.login(email, password);
        await this.router.navigateByUrl('/dashboard');
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Something went wrong.';
    } finally {
      this.loading = false;
    }
  }
}
