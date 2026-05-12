import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { AuthStore } from '../../core/state/auth.store';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);
  protected readonly showLoginPassword = signal(false);
  protected readonly showRegisterPassword = signal(false);
  protected readonly showRegisterConfirmPassword = signal(false);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)],
    ],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.matchFieldsValidator('password', 'confirmPassword') });

  protected readonly forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly verifyForm = this.fb.nonNullable.group({
    token: ['', [Validators.required, Validators.minLength(20)]],
  });

  protected submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authStore
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/app/dashboard'),
        error: (error) => {
          this.snackBar.open(error.error?.message ?? 'Login failed', 'Close', { duration: 3000 });
        },
      });
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { fullName, email, password } = this.registerForm.getRawValue();
    this.authStore
      .register({ fullName, email, password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (message) => {
          this.snackBar.open(message, 'Close', { duration: 4000 });
          this.registerForm.reset({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
          });
        },
        error: (error) => {
          this.snackBar.open(this.extractApiError(error), 'Close', { duration: 4500 });
        },
      });
  }

  protected submitForgotPassword(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authStore
      .forgotPassword(this.forgotForm.getRawValue().email)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (message) => this.snackBar.open(message, 'Close', { duration: 3500 }),
        error: (error) => this.snackBar.open(error.error?.message ?? 'Failed to send email', 'Close', { duration: 3000 }),
      });
  }

  protected submitVerifyEmail(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authStore
      .verifyEmail(this.verifyForm.getRawValue().token)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (message) => this.snackBar.open(message, 'Close', { duration: 3500 }),
        error: (error) => this.snackBar.open(error.error?.message ?? 'Verification failed', 'Close', { duration: 3000 }),
      });
  }

  protected hasRegisterMismatchError(): boolean {
    return Boolean(this.registerForm.errors?.['fieldsMismatch']) && this.registerForm.touched;
  }

  private matchFieldsValidator(primaryField: string, confirmField: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const primaryValue = group.get(primaryField)?.value;
      const confirmValue = group.get(confirmField)?.value;
      return primaryValue === confirmValue ? null : { fieldsMismatch: true };
    };
  }

  private extractApiError(error: unknown): string {
    const fallback = 'Registration failed';
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const maybeError = error as {
      error?: {
        message?: string;
        errors?: Array<{ msg?: string }>;
      };
    };

    const validationError = maybeError.error?.errors?.[0]?.msg;
    if (validationError) {
      return validationError;
    }

    return maybeError.error?.message ?? fallback;
  }
}
