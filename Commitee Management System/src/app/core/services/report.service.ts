import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiClientService } from './api-client.service';

interface Report {
  _id: string;
  type: string;
  format: string;
  createdAt: string;
  summary: {
    collections: number;
    payouts: number;
    pendingPayments: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private readonly api: ApiClientService,
    private readonly http: HttpClient,
  ) {}

  listReports(): Observable<Report[]> {
    return this.api.get<Report[]>('/reports').pipe(map((response) => response.data));
  }

  generate(payload: {
    type: 'monthly' | 'committee' | 'financial' | 'custom';
    format: 'pdf' | 'xlsx';
    startDate: string;
    endDate: string;
    committeeId?: string;
  }): Observable<Blob> {
    return this.http.post(`${environment.apiBaseUrl}/reports/generate`, payload, {
      responseType: 'blob',
    });
  }
}
