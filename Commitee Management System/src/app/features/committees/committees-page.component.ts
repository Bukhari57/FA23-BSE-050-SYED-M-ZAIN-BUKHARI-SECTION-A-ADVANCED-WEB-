import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { Committee } from '../../core/models/committee.model';
import { CommitteeService } from '../../core/services/committee.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-committees-page',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
    EmptyStateComponent,
  ],
  templateUrl: './committees-page.component.html',
  styleUrl: './committees-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommitteesPageComponent implements OnInit {
  private readonly committeeService = inject(CommitteeService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly committees = signal<Committee[]>([]);
  protected readonly loading = signal(false);

  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    monthlyAmount: [10000, [Validators.required, Validators.min(1)]],
    durationMonths: [12, [Validators.required, Validators.min(1)]],
    memberLimit: [10, [Validators.required, Validators.min(2)]],
    startDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    payoutDayOfMonth: [5, [Validators.required, Validators.min(1), Validators.max(28)]],
    description: [''],
    tags: ['premium,active'],
  });

  protected readonly filterForm = this.fb.nonNullable.group({
    status: [''],
    search: [''],
  });

  ngOnInit(): void {
    this.loadCommittees();
  }

  protected loadCommittees(): void {
    this.loading.set(true);
    const { status, search } = this.filterForm.getRawValue();

    this.committeeService
      .list({ status, search, page: 1, limit: 30 })
      .subscribe({
        next: ({ items }) => {
          this.committees.set(items);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.snackBar.open(error.error?.message ?? 'Failed to load committees', 'Close', { duration: 3000 });
        },
      });
  }

  protected submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const data = this.createForm.getRawValue();

    this.committeeService
      .create({
        ...data,
        tags: data.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Committee created', 'Close', { duration: 2500 });
          this.createForm.patchValue({ name: '', description: '' });
          this.loadCommittees();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message ?? 'Failed to create committee', 'Close', { duration: 3000 });
        },
      });
  }

  protected rotatePayout(committeeId: string): void {
    this.committeeService.rotatePayout(committeeId).subscribe({
      next: () => {
        this.snackBar.open('Payout rotated successfully', 'Close', { duration: 2500 });
        this.loadCommittees();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message ?? 'Payout rotation failed', 'Close', { duration: 3000 });
      },
    });
  }
}
