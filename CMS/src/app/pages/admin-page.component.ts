import { CurrencyPipe, NgFor } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Committee, Payment, Profile } from '../models';
import { CommitteeService } from '../services/committee.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, NgFor],
  template: `
    <section class="page">
      <div class="section-head">
        <div>
          <span class="eyebrow">Admin</span>
          <h1>System overview.</h1>
        </div>
      </div>

      <div class="grid cols-4">
        <article class="card stat"><span class="muted">Users</span><strong>{{ users.length }}</strong></article>
        <article class="card stat"><span class="muted">Committees</span><strong>{{ committees.length }}</strong></article>
        <article class="card stat"><span class="muted">Payments</span><strong>{{ payments.length }}</strong></article>
        <article class="card stat"><span class="muted">Confirmed value</span><strong>{{ confirmedValue | currency }}</strong></article>
      </div>

      <div class="section grid cols-2">
        <div class="panel">
          <h2>Users</h2>
          <table class="table">
            <thead><tr><th>Name</th><th>Score</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.full_name }}</td>
                <td>{{ user.trust_score }}</td>
                <td><span class="badge" [class.danger]="user.is_banned">{{ user.is_banned ? 'banned' : 'active' }}</span></td>
                <td><button class="btn secondary" type="button" (click)="toggleBan(user)">{{ user.is_banned ? 'Unban' : 'Ban' }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="panel">
          <h2>Committees</h2>
          <table class="table">
            <thead><tr><th>Name</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let committee of committees">
                <td>{{ committee.name }}</td>
                <td>{{ committee.monthly_amount | currency }}</td>
                <td><span class="badge">{{ committee.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class AdminPageComponent implements OnInit {
  private readonly committeesApi = inject(CommitteeService);

  users: Profile[] = [];
  committees: Committee[] = [];
  payments: Payment[] = [];

  get confirmedValue() {
    return this.payments
      .filter((payment) => payment.status === 'confirmed')
      .reduce((total, payment) => total + Number(payment.amount), 0);
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const data = await this.committeesApi.adminStats();
    this.users = data.users;
    this.committees = data.committees;
    this.payments = data.payments;
  }

  async toggleBan(user: Profile) {
    await this.committeesApi.banUser(user.id, !user.is_banned);
    await this.load();
  }
}
