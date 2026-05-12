import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiClientService } from '../../core/services/api-client.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiClientService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly showCurrentPassword = signal(false);
  protected readonly showNewPassword = signal(false);

  protected readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.minLength(2)]],
    phone: [''],
    avatarUrl: [''],
  });

  protected readonly notificationForm = this.fb.nonNullable.group({
    email: [true],
    push: [true],
    dueReminders: [true],
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected updateProfile(): void {
    this.api.patch('/settings/profile', this.profileForm.getRawValue()).subscribe({
      next: () => this.snackBar.open('Profile updated', 'Close', { duration: 2500 }),
      error: (error) => this.snackBar.open(error.error?.message ?? 'Profile update failed', 'Close', { duration: 3000 }),
    });
  }

  protected updateNotifications(): void {
    this.api.patch('/settings/notifications', this.notificationForm.getRawValue()).subscribe({
      next: () => this.snackBar.open('Notification preferences saved', 'Close', { duration: 2500 }),
      error: (error) => this.snackBar.open(error.error?.message ?? 'Update failed', 'Close', { duration: 3000 }),
    });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.api.patch('/settings/change-password', this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 2500 });
        this.passwordForm.reset({ currentPassword: '', newPassword: '' });
      },
      error: (error) => this.snackBar.open(error.error?.message ?? 'Password change failed', 'Close', { duration: 3000 }),
    });
  }
}
