import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Committee, Member, Payment, Transaction } from '../models/committee.model';
import { ApiClientService } from './api-client.service';
import { ApiResponse, PaginatedResult } from '../models/api.model';

interface CommitteeDetails {
  committee: Committee;
  members: Member[];
  history: Transaction[];
}

@Injectable({ providedIn: 'root' })
export class CommitteeService {
  constructor(private readonly api: ApiClientService) {}

  list(query: Record<string, string | number | undefined>): Observable<PaginatedResult<Committee>> {
    return this.api.get<Committee[]>('/committees', query).pipe(
      map((response) => ({
        items: response.data,
        page: response.meta?.page ?? 1,
        limit: response.meta?.limit ?? 10,
        total: response.meta?.total ?? response.data.length,
        totalPages: response.meta?.totalPages ?? 1,
      })),
    );
  }

  create(payload: Partial<Committee>): Observable<Committee> {
    return this.api.post<Committee>('/committees', payload).pipe(map((response) => response.data));
  }

  detail(id: string): Observable<CommitteeDetails> {
    return this.api.get<CommitteeDetails>(`/committees/${id}`).pipe(map((response) => response.data));
  }

  update(id: string, payload: Partial<Committee>): Observable<Committee> {
    return this.api.patch<Committee>(`/committees/${id}`, payload).pipe(map((response) => response.data));
  }

  rotatePayout(id: string): Observable<ApiResponse<{ payoutMember: Member; committee: Committee }>> {
    return this.api.post<{ payoutMember: Member; committee: Committee }>(`/committees/${id}/rotate-payout`, {});
  }

  listMembers(query: Record<string, string | number | undefined>): Observable<PaginatedResult<Member>> {
    return this.api.get<Member[]>('/members', query).pipe(
      map((response) => ({
        items: response.data,
        page: response.meta?.page ?? 1,
        limit: response.meta?.limit ?? 10,
        total: response.meta?.total ?? response.data.length,
        totalPages: response.meta?.totalPages ?? 1,
      })),
    );
  }

  createMember(payload: Partial<Member> | FormData): Observable<Member> {
    return this.api.post<Member>('/members', payload).pipe(map((response) => response.data));
  }

  updateMember(id: string, payload: Partial<Member> | FormData): Observable<Member> {
    return this.api.patch<Member>(`/members/${id}`, payload).pipe(map((response) => response.data));
  }

  deleteMember(id: string): Observable<string> {
    return this.api.delete<never>(`/members/${id}`).pipe(map((response) => response.message ?? 'Deleted'));
  }

  listPayments(query: Record<string, string | number | undefined>): Observable<PaginatedResult<Payment>> {
    return this.api.get<Payment[]>('/payments', query).pipe(
      map((response) => ({
        items: response.data,
        page: response.meta?.page ?? 1,
        limit: response.meta?.limit ?? 10,
        total: response.meta?.total ?? response.data.length,
        totalPages: response.meta?.totalPages ?? 1,
      })),
    );
  }

  createPayment(payload: Partial<Payment>): Observable<Payment> {
    return this.api.post<Payment>('/payments', payload).pipe(map((response) => response.data));
  }

  updatePayment(id: string, payload: Partial<Payment>): Observable<Payment> {
    return this.api.patch<Payment>(`/payments/${id}`, payload).pipe(map((response) => response.data));
  }
}
