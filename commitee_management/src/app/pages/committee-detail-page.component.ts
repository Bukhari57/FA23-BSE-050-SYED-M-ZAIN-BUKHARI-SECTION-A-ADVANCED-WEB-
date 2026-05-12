import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Committee, CommitteeMember, Payment } from '../models';
import { AuthService } from '../services/auth.service';
import { CommitteeService } from '../services/committee.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgFor, NgIf, ReactiveFormsModule],
  template: `
    <section class="page" *ngIf="committee">
      <div class="section-head">
        <div>
          <span class="eyebrow">{{ committee.status }}</span>
          <h1>{{ committee.name }}</h1>
          <p>{{ committee.description }}</p>
        </div>
        <span class="badge">{{ committee.monthly_amount | currency }} monthly</span>
      </div>

      <div class="grid cols-4">
        <article class="card stat"><span class="muted">Duration</span><strong>{{ committee.duration_months }}</strong><span>months</span></article>
        <article class="card stat"><span class="muted">Current month</span><strong>{{ committee.current_month }}</strong><span>of {{ committee.duration_months }}</span></article>
        <article class="card stat"><span class="muted">Members</span><strong>{{ approvedMembers.length }}</strong><span>of {{ committee.max_members }}</span></article>
        <article class="card stat"><span class="muted">Next receiver</span><strong>{{ nextReceiver?.profile?.full_name || 'TBD' }}</strong><span>turn {{ nextReceiver?.turn_order || '-' }}</span></article>
      </div>

      <div class="section panel">
        <div class="section-head">
          <h2>Completion</h2>
          <span class="muted">Started {{ committee.start_date | date }}</span>
        </div>
        <div class="progress"><span [style.width.%]="progress"></span></div>
      </div>

      <div class="section grid cols-2">
        <div class="panel">
          <h2>Members and approvals</h2>
          <table class="table">
            <thead>
              <tr><th>Member</th><th>Turn</th><th>Status</th><th *ngIf="isCreator">Action</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let member of members">
                <td>
                  <strong>{{ member.profile?.full_name || 'Member' }}</strong>
                  <div class="muted">{{ member.payment_method || 'No method' }} · {{ member.iban || member.bank_details || 'No bank details' }}</div>
                </td>
                <td>{{ member.turn_order }}</td>
                <td><span class="badge" [class.warn]="member.status === 'pending'" [class.danger]="member.status === 'removed'">{{ member.status }}</span></td>
                <td *ngIf="isCreator">
                  <button class="btn secondary" type="button" *ngIf="member.status === 'pending'" (click)="updateMember(member.id, 'approved')">Approve</button>
                  <button class="btn danger" type="button" *ngIf="member.status !== 'removed'" (click)="updateMember(member.id, 'removed')">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="panel">
          <h2>Timeline</h2>
          <div class="timeline">
            <div class="timeline-item" *ngFor="let member of approvedMembers">
              <span class="timeline-dot"></span>
              <div>
                <strong>Month {{ member.turn_order }}: {{ member.profile?.full_name || 'Member' }}</strong>
                <p>Receiver turn for this committee cycle.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section grid cols-2">
        <div class="panel">
          <h2>Payment tracking</h2>
          <table class="table" *ngIf="payments.length; else noPayments">
            <thead><tr><th>Month</th><th>Member</th><th>Status</th><th>Proof</th><th *ngIf="isCreator">Confirm</th></tr></thead>
            <tbody>
              <tr *ngFor="let payment of payments">
                <td>{{ payment.month_number }}</td>
                <td>{{ payment.member?.profile?.full_name || 'Member' }}</td>
                <td><span class="badge" [class.warn]="payment.status !== 'confirmed'">{{ payment.status }}</span></td>
                <td><a class="link-button" *ngIf="payment.proof_url" [href]="payment.proof_url" target="_blank">Open</a></td>
                <td *ngIf="isCreator"><button class="btn secondary" type="button" (click)="confirm(payment.id)">Confirm</button></td>
              </tr>
            </tbody>
          </table>
          <ng-template #noPayments><div class="empty">No payment records yet.</div></ng-template>
        </div>

        <div class="panel">
          <h2>Record payment</h2>
          <form class="form" [formGroup]="paymentForm" (ngSubmit)="savePayment()">
            <div class="grid cols-2">
              <div class="field">
                <label for="month">Month</label>
                <input id="month" type="number" formControlName="month_number">
              </div>
              <div class="field">
                <label for="amount">Amount</label>
                <input id="amount" type="number" formControlName="amount">
              </div>
            </div>
            <div class="field">
              <label for="member">Member</label>
              <select id="member" formControlName="member_id">
                <option *ngFor="let member of approvedMembers" [value]="member.id">{{ member.profile?.full_name || member.id }}</option>
              </select>
            </div>
            <div class="field">
              <label for="proof">Payment proof screenshot</label>
              <input id="proof" type="file" accept="image/*" (change)="proof = $any($event.target).files?.[0] || null">
            </div>
            <p class="error" *ngIf="error">{{ error }}</p>
            <button class="btn" type="submit" [disabled]="paymentForm.invalid">Save payment</button>
          </form>
        </div>
      </div>
    </section>
  `
})
export class CommitteeDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly committees = inject(CommitteeService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  committee?: Committee;
  members: CommitteeMember[] = [];
  payments: Payment[] = [];
  userId = '';
  proof: File | null = null;
  error = '';

  readonly paymentForm = this.fb.nonNullable.group({
    month_number: [1, [Validators.required, Validators.min(1)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    member_id: ['', Validators.required]
  });

  get isCreator() {
    return this.committee?.creator_id === this.userId;
  }

  get approvedMembers() {
    return this.members.filter((member) => member.status === 'approved');
  }

  get nextReceiver() {
    if (!this.committee) {
      return undefined;
    }
    return this.approvedMembers.find((member) => member.turn_order === this.committee?.current_month);
  }

  get progress() {
    if (!this.committee) {
      return 0;
    }
    return Math.min(100, Math.round((this.committee.current_month / this.committee.duration_months) * 100));
  }

  async ngOnInit() {
    const user = await this.auth.currentUser();
    this.userId = user?.id || '';
    await this.load();
  }

  async load() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const data = await this.committees.getCommittee(id);
    this.committee = data.committee;
    this.members = data.members;
    this.payments = data.payments;
    this.paymentForm.patchValue({
      amount: data.committee.monthly_amount,
      month_number: data.committee.current_month,
      member_id: this.approvedMembers[0]?.id || ''
    });
  }

  async updateMember(memberId: string, status: 'approved' | 'removed') {
    await this.committees.updateMemberStatus(memberId, status);
    await this.load();
  }

  async savePayment() {
    if (!this.committee || this.paymentForm.invalid) {
      return;
    }
    this.error = '';
    try {
      await this.committees.savePayment(
        {
          ...this.paymentForm.getRawValue(),
          committee_id: this.committee.id,
          status: 'paid'
        },
        this.proof || undefined
      );
      this.proof = null;
      await this.load();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Could not save payment.';
    }
  }

  async confirm(paymentId: string) {
    await this.committees.confirmPayment(paymentId);
    await this.load();
  }
}
