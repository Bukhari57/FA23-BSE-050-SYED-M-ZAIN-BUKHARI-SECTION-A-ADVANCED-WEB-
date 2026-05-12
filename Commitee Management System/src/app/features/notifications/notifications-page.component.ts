import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiClientService } from '../../core/services/api-client.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatCardModule, MatSnackBarModule, EmptyStateComponent],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPageComponent implements OnInit {
  private readonly api = inject(ApiClientService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly notifications = signal<Array<{ _id: string; title: string; body: string; type: string; createdAt: string; readAt?: string }>>([]);

  ngOnInit(): void {
    this.loadNotifications();
  }

  protected loadNotifications(): void {
    this.api.get<Array<{ _id: string; title: string; body: string; type: string; createdAt: string; readAt?: string }>>('/notifications').subscribe({
      next: (response) => this.notifications.set(response.data),
      error: (error) => this.snackBar.open(error.error?.message ?? 'Failed to load notifications', 'Close', { duration: 3000 }),
    });
  }

  protected markRead(id: string): void {
    this.api.patch(`/notifications/${id}/read`, {}).subscribe({
      next: () => {
        this.snackBar.open('Notification marked as read', 'Close', { duration: 2500 });
        this.loadNotifications();
      },
      error: (error) => this.snackBar.open(error.error?.message ?? 'Failed to update notification', 'Close', { duration: 3000 }),
    });
  }
}
