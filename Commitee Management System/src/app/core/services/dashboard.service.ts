import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { Transaction } from '../models/committee.model';

interface DashboardData {
  stats: {
    totalCommittees: number;
    activeMembers: number;
    monthlyCollections: number;
    upcomingPayouts: number;
  };
  chart: Array<{ _id: { year: number; month: number }; collected: number; due: number }>;
  recentTransactions: Transaction[];
  notifications: Array<{
    _id: string;
    title: string;
    body: string;
    type: string;
    createdAt: string;
    readAt?: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiClientService) {}

  getDashboard(): Observable<DashboardData> {
    return this.api.get<DashboardData>('/dashboard').pipe(map((response) => response.data));
  }
}
