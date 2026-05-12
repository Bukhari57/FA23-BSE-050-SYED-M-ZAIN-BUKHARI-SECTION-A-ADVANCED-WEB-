import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly api: ApiClientService) {}

  listUsers(): Observable<User[]> {
    return this.api.get<Array<User & { _id?: string }>>('/admin/users').pipe(
      map((response) =>
        response.data.map((user) => ({
          ...user,
          id: user.id ?? user._id ?? '',
        })),
      ),
    );
  }

  listAuditLogs(): Observable<unknown[]> {
    return this.api.get<unknown[]>('/admin/audit-logs').pipe(map((response) => response.data));
  }

  updateUserRole(userId: string, payload: { role?: User['role']; isActive?: boolean }): Observable<User> {
    return this.api
      .patch<User>(`/admin/users/${userId}`, payload)
      .pipe(map((response) => response.data));
  }
}
