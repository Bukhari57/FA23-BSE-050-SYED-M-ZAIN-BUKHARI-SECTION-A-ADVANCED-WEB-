import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommitteeService } from '../../core/services/committee.service';
import { Member } from '../../core/models/committee.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    EmptyStateComponent,
  ],
  templateUrl: './members-page.component.html',
  styleUrl: './members-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly committeeService = inject(CommitteeService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly members = signal<Member[]>([]);
  protected readonly loading = signal(false);
  protected readonly uploadingImage = signal(false);
  protected readonly selectedImageName = signal('');
  private selectedImageFile: File | null = null;

  protected readonly memberForm = this.fb.nonNullable.group({
    committee: ['', [Validators.required]],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    cnic: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    position: [1, [Validators.required, Validators.min(1)]],
    iban: [''],
    accountTitle: [''],
    transactionId: [''],
  });

  ngOnInit(): void {
    this.loadMembers();
  }

  protected loadMembers(): void {
    this.loading.set(true);
    this.committeeService.listMembers({ page: 1, limit: 40 }).subscribe({
      next: ({ items }) => {
        this.members.set(items);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(error.error?.message ?? 'Failed to load members', 'Close', { duration: 3000 });
      },
    });
  }

  protected async submitMember(): Promise<void> {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    let profileImageUrl: string | undefined;
    if (this.selectedImageFile) {
      if (!this.supabaseService.isConfigured) {
        this.snackBar.open(
          'Supabase is not configured. Add URL and ANON key in environment file to upload profile image.',
          'Close',
          { duration: 4500 },
        );
        return;
      }

      try {
        this.uploadingImage.set(true);
        profileImageUrl = await this.supabaseService.uploadMemberProfileImage(this.selectedImageFile);
      } catch (error) {
        this.uploadingImage.set(false);
        this.snackBar.open(
          error instanceof Error ? error.message : 'Failed to upload image to Supabase',
          'Close',
          { duration: 4000 },
        );
        return;
      } finally {
        this.uploadingImage.set(false);
      }
    }

    this.committeeService.createMember({ ...this.memberForm.getRawValue(), profileImageUrl }).subscribe({
      next: () => {
        this.snackBar.open('Member added successfully', 'Close', { duration: 2500 });
        this.memberForm.patchValue({
          fullName: '',
          email: '',
          cnic: '',
          phone: '',
          iban: '',
          accountTitle: '',
          transactionId: '',
        });
        this.selectedImageFile = null;
        this.selectedImageName.set('');
        this.loadMembers();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message ?? 'Failed to create member', 'Close', { duration: 3000 });
      },
    });
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImageFile = file;
    this.selectedImageName.set(file?.name ?? '');
  }

  protected deleteMember(memberId: string): void {
    this.committeeService.deleteMember(memberId).subscribe({
      next: () => {
        this.snackBar.open('Member deleted', 'Close', { duration: 2500 });
        this.loadMembers();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message ?? 'Failed to delete member', 'Close', { duration: 3000 });
      },
    });
  }
}
