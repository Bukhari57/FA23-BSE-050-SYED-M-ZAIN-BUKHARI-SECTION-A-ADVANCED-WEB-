import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Committee, NotificationItem, Payment, Profile } from '../models';
import { AuthService } from '../services/auth.service';
import { CommitteeService } from '../services/committee.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgFor, NgIf, RouterLink],
  template: `
    <section class="page">
      <div class="section-head">
        <div>
          <span class="eyebrow">Dashboard</span>
          <h1>Good to see you, {{ profile?.full_name || 'member' }}.</h1>
        </div>
        <a class="btn" routerLink="/committees/new">Create committee</a>
      </div>

      <div class="grid cols-4">
        <article class="card stat">
          <span class="muted">Trust score</span>
          <strong>{{ profile?.trust_score || 60 }}</strong>
          <span class="badge">Reputation</span>
        </article>
        <article class="card stat">
          <span class="muted">Joined</span>
          <strong>{{ joined.length }}</strong>
          <span class="badge">Active history</span>
        </article>
        <article class="card stat">
          <span class="muted">Created</span>
          <strong>{{ created.length }}</strong>
          <span class="badge">Owner role</span>
        </article>
        <article class="card stat">
          <span class="muted">Pending payments</span>
          <strong>{{ payments.length }}</strong>
          <span class="badge warn">Needs review</span>
        </article>
      </div>

      <div class="section grid cols-2">
        <div class="panel">
          <div class="section-head">
            <h2>Active committees</h2>
            <a class="link-button" routerLink="/committees">Browse</a>
          </div>
          <div class="stack" *ngIf="joined.length; else noJoined">
            <article class="card" *ngFor="let committee of joined">
              <div class="row">
                <div>
                  <h3>{{ committee.name }}</h3>
                  <p>{{ committee.monthly_amount | currency }} monthly · {{ committee.duration_months }} months</p>
                </div>
                <span class="badge">{{ committee.status }}</span>
              </div>
              <div class="progress"><span [style.width.%]="progress(committee)"></span></div>
              <a class="link-button" [routerLink]="['/committees', committee.id]">Open details</a>
            </article>
          </div>
          <ng-template #noJoined><div class="empty">No joined committees yet.</div></ng-template>
        </div>

        <div class="panel">
          <h2>Upcoming and pending payments</h2>
          <div class="stack" *ngIf="payments.length; else noPayments">
            <article class="card" *ngFor="let payment of payments">
              <div class="row">
                <div>
                  <strong>Month {{ payment.month_number }}</strong>
                  <p>{{ payment.amount | currency }} · {{ payment.status }}</p>
                </div>
                <span class="badge warn">Due</span>
              </div>
            </article>
          </div>
          <ng-template #noPayments><div class="empty">No pending payments.</div></ng-template>
        </div>
      </div>

      <div class="section grid cols-2">
        <div class="panel">
          <h2>Created by you</h2>
          <div class="stack" *ngIf="created.length; else noCreated">
            <article class="card" *ngFor="let committee of created">
              <div class="row">
                <div>
                  <h3>{{ committee.name }}</h3>
                  <p>Starts {{ committee.start_date | date }} · {{ committee.status }}</p>
                </div>
                <a class="btn secondary" [routerLink]="['/committees', committee.id]">Manage</a>
              </div>
            </article>
          </div>
          <ng-template #noCreated><div class="empty">Create your first committee when ready.</div></ng-template>
        </div>

        <div class="panel">
          <h2>Notifications</h2>
          <div class="stack" *ngIf="notifications.length; else noNotifications">
            <article class="card" *ngFor="let item of notifications">
              <strong>{{ item.title }}</strong>
              <p>{{ item.body }}</p>
              <small class="muted">{{ item.created_at | date:'medium' }}</small>
            </article>
          </div>
          <ng-template #noNotifications><div class="empty">You are all caught up.</div></ng-template>
        </div>
      </div>
    </section>
  `
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly committees = inject(CommitteeService);
  private channel?: RealtimeChannel;

  profile: Profile | null = null;
  joined: Committee[] = [];
  created: Committee[] = [];
  payments: Payment[] = [];
  notifications: NotificationItem[] = [];

  async ngOnInit() {
    this.profile = await this.auth.ensureProfile();
    await this.load();
    if (this.profile) {
      this.channel = this.committees.subscribeToNotifications(this.profile.id, () => void this.load());
    }
  }

  ngOnDestroy() {
    void this.channel?.unsubscribe();
  }

  async load() {
    const data = await this.committees.dashboard();
    this.joined = data.joined;
    this.created = data.created;
    this.payments = data.payments;
    this.notifications = data.notifications;
  }

  progress(committee: Committee) {
    return Math.min(100, Math.round((committee.current_month / committee.duration_months) * 100));
  }
}
