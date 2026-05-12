import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Committee } from '../models';
import { CommitteeService } from '../services/committee.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, NgFor, NgIf, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="section-head">
        <div>
          <span class="eyebrow">Open committees</span>
          <h1>Find a trusted savings circle.</h1>
        </div>
        <a class="btn" routerLink="/committees/new">Create committee</a>
      </div>

      <div class="grid cols-3" *ngIf="committees.length; else empty">
        <article class="card stack" *ngFor="let committee of committees">
          <div class="row">
            <span class="badge">{{ committee.status }}</span>
            <span class="muted">{{ committee.member_count || 0 }}/{{ committee.max_members }} members</span>
          </div>
          <h2>{{ committee.name }}</h2>
          <p>{{ committee.description }}</p>
          <div class="stack">
            <strong>{{ committee.monthly_amount | currency }} monthly</strong>
            <span class="muted">{{ committee.duration_months }} months · by {{ committee.creator?.full_name || 'Member' }}</span>
            <span class="badge">Creator score {{ committee.creator?.trust_score || 60 }}</span>
          </div>
          <button class="btn secondary" type="button" (click)="selected = committee">Request to join</button>
          <a class="link-button" [routerLink]="['/committees', committee.id]">View details</a>
        </article>
      </div>
      <ng-template #empty><div class="empty">No open committees yet.</div></ng-template>

      <div class="panel section" *ngIf="selected">
        <div class="section-head">
          <h2>Join {{ selected.name }}</h2>
          <button class="link-button" type="button" (click)="selected = null">Close</button>
        </div>
        <form class="form" [formGroup]="joinForm" (ngSubmit)="requestJoin()">
          <div class="grid cols-2">
            <div class="field">
              <label for="transaction">Transaction ID</label>
              <input id="transaction" formControlName="transaction_id">
            </div>
            <div class="field">
              <label for="method">Payment method</label>
              <select id="method" formControlName="payment_method">
                <option>Bank transfer</option>
                <option>JazzCash</option>
                <option>EasyPaisa</option>
                <option>Cash</option>
              </select>
            </div>
          </div>
          <div class="grid cols-2">
            <div class="field">
              <label for="iban">IBAN</label>
              <input id="iban" formControlName="iban">
            </div>
            <div class="field">
              <label for="bank">Bank account details</label>
              <input id="bank" formControlName="bank_details">
            </div>
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="badge" *ngIf="message">{{ message }}</p>
          <button class="btn" type="submit" [disabled]="joinForm.invalid || loading">
            {{ loading ? 'Sending...' : 'Send request' }}
          </button>
        </form>
      </div>
    </section>
  `
})
export class CommitteeListPageComponent implements OnInit {
  private readonly committeesApi = inject(CommitteeService);
  private readonly fb = inject(FormBuilder);

  committees: Committee[] = [];
  selected: Committee | null = null;
  loading = false;
  error = '';
  message = '';

  readonly joinForm = this.fb.nonNullable.group({
    transaction_id: ['', Validators.required],
    payment_method: ['Bank transfer', Validators.required],
    iban: [''],
    bank_details: ['', Validators.required]
  });

  async ngOnInit() {
    this.committees = await this.committeesApi.listOpenCommittees();
  }

  async requestJoin() {
    if (!this.selected || this.joinForm.invalid) {
      return;
    }
    this.loading = true;
    this.error = '';
    this.message = '';
    try {
      await this.committeesApi.requestJoin(this.selected.id, this.joinForm.getRawValue());
      this.message = 'Request sent to the committee creator.';
      this.joinForm.reset({ payment_method: 'Bank transfer' });
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Could not send request.';
    } finally {
      this.loading = false;
    }
  }
}
