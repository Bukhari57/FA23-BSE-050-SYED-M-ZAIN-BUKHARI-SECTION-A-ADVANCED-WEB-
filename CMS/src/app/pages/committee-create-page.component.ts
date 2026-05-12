import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommitteeService } from '../services/committee.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <section class="page">
      <div class="section-head">
        <div>
          <span class="eyebrow">New committee</span>
          <h1>Create a monthly savings group.</h1>
        </div>
      </div>

      <form class="panel form" [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid cols-2">
          <div class="field">
            <label for="name">Committee name</label>
            <input id="name" formControlName="name">
          </div>
          <div class="field">
            <label for="startDate">Start date</label>
            <input id="startDate" type="date" formControlName="start_date">
          </div>
        </div>
        <div class="field">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description"></textarea>
        </div>
        <div class="grid cols-3">
          <div class="field">
            <label for="duration">Duration in months</label>
            <input id="duration" type="number" min="2" formControlName="duration_months">
          </div>
          <div class="field">
            <label for="amount">Monthly contribution</label>
            <input id="amount" type="number" min="1" formControlName="monthly_amount">
          </div>
          <div class="field">
            <label for="members">Maximum members</label>
            <input id="members" type="number" min="2" formControlName="max_members">
          </div>
        </div>
        <p class="error" *ngIf="error">{{ error }}</p>
        <button class="btn" type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Creating...' : 'Create committee' }}
        </button>
      </form>
    </section>
  `
})
export class CommitteeCreatePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly committees = inject(CommitteeService);
  private readonly router = inject(Router);

  loading = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    duration_months: [6, [Validators.required, Validators.min(2)]],
    monthly_amount: [10000, [Validators.required, Validators.min(1)]],
    max_members: [6, [Validators.required, Validators.min(2)]],
    start_date: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  async submit() {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const committee = await this.committees.createCommittee(this.form.getRawValue());
      await this.router.navigate(['/committees', committee.id]);
    } catch (err) {
      this.error = this.readError(err);
    } finally {
      this.loading = false;
    }
  }

  private readError(err: unknown) {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'object' && err) {
      const supabaseError = err as { message?: string; details?: string; hint?: string; code?: string };
      return [supabaseError.message, supabaseError.details, supabaseError.hint, supabaseError.code]
        .filter(Boolean)
        .join(' ');
    }
    return 'Could not create committee.';
  }
}
