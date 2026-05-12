import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReportService } from '../../core/services/report.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly reports = signal<
    Array<{
      _id: string;
      type: string;
      format: string;
      createdAt: string;
      summary: { collections: number; payouts: number; pendingPayments: number };
    }>
  >([]);

  protected readonly reportForm = this.fb.nonNullable.group({
    type: ['financial', [Validators.required]],
    format: ['pdf', [Validators.required]],
    startDate: [new Date(new Date().setDate(1)).toISOString().slice(0, 10), [Validators.required]],
    endDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    committeeId: [''],
  });

  ngOnInit(): void {
    this.loadReports();
  }

  protected loadReports(): void {
    this.reportService.listReports().subscribe({
      next: (reports) => this.reports.set(reports),
      error: (error) => this.snackBar.open(error.error?.message ?? 'Failed to load reports', 'Close', { duration: 3000 }),
    });
  }

  protected generate(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const formValue = this.reportForm.getRawValue();
    this.reportService
      .generate({
        type: formValue.type as 'monthly' | 'committee' | 'financial' | 'custom',
        format: formValue.format as 'pdf' | 'xlsx',
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        committeeId: formValue.committeeId || undefined,
      })
      .subscribe({
      next: (blob) => {
        const format = this.reportForm.getRawValue().format;
        const ext = format === 'pdf' ? 'pdf' : 'xlsx';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `committee-report.${ext}`;
        link.click();
        URL.revokeObjectURL(link.href);
        this.snackBar.open('Report generated successfully', 'Close', { duration: 2500 });
        this.loadReports();
      },
      error: (error) => this.snackBar.open(error.error?.message ?? 'Report generation failed', 'Close', { duration: 3000 }),
    });
  }
}
