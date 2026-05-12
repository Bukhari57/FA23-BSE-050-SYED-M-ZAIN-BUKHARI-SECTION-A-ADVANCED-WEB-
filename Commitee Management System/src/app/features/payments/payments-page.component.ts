import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { CommitteeService } from '../../core/services/committee.service';
import { Payment } from '../../core/models/committee.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    UpperCasePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
    EmptyStateComponent,
  ],
  templateUrl: './payments-page.component.html',
  styleUrl: './payments-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly committeeService = inject(CommitteeService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly payments = signal<Payment[]>([]);
  protected readonly loading = signal(false);

  protected readonly paymentForm = this.fb.nonNullable.group({
    committee: ['', [Validators.required]],
    member: ['', [Validators.required]],
    dueDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    amount: [10000, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadPayments();
  }

  protected loadPayments(): void {
    this.loading.set(true);
    this.committeeService.listPayments({ page: 1, limit: 50 }).subscribe({
      next: ({ items }) => {
        this.payments.set(items);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(error.error?.message ?? 'Failed to load payments', 'Close', { duration: 3000 });
      },
    });
  }

  protected submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.committeeService.createPayment(this.paymentForm.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Payment record created', 'Close', { duration: 2500 });
        this.loadPayments();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message ?? 'Failed to create payment', 'Close', { duration: 3000 });
      },
    });
  }

  protected markAsPaid(payment: Payment): void {
    this.committeeService
      .updatePayment(payment._id, {
        paidAmount: payment.amount + payment.fineAmount,
        status: 'paid',
        paidAt: new Date().toISOString(),
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Payment marked as paid', 'Close', { duration: 2500 });
          this.loadPayments();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message ?? 'Failed to update payment', 'Close', { duration: 3000 });
        },
      });
  }
}
