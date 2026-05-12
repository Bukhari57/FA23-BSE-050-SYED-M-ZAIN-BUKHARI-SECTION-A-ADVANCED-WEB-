import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly users = signal<User[]>([]);
  protected readonly auditLogs = signal<Array<{ _id: string; action: string; resourceType: string; createdAt: string; actor?: { fullName: string } }>>([]);
  protected readonly search = signal('');

  protected readonly filteredUsers = computed(() => {
    const term = this.search().toLowerCase().trim();
    const list = [...this.users()].sort((a, b) => a.fullName.localeCompare(b.fullName));

    if (!term) {
      return list;
    }

    return list.filter((user) => `${user.fullName} ${user.email} ${user.role}`.toLowerCase().includes(term));
  });

  protected readonly filteredAuditLogs = computed(() => {
    const term = this.search().toLowerCase().trim();
    const list = [...this.auditLogs()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!term) {
      return list;
    }

    return list.filter((log) => `${log.action} ${log.resourceType} ${log.actor?.fullName ?? 'system'}`.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.adminService.listUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (error) => this.snackBar.open(error.error?.message ?? 'Failed to load users', 'Close', { duration: 3000 }),
    });

    this.adminService.listAuditLogs().subscribe({
      next: (logs) => this.auditLogs.set(logs as never),
      error: (error) => this.snackBar.open(error.error?.message ?? 'Failed to load audit logs', 'Close', { duration: 3000 }),
    });
  }

  protected toggleUserStatus(user: User): void {
    this.adminService.updateUserRole(user.id, { isActive: !user.isActive }).subscribe({
      next: () => {
        this.snackBar.open('User updated', 'Close', { duration: 2500 });
        this.loadData();
      },
      error: (error) => this.snackBar.open(error.error?.message ?? 'Failed to update user', 'Close', { duration: 3000 }),
    });
  }

  protected updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.search.set(input.value);
  }
}
