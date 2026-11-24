import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StudentEnrollmentItem } from '../student-portal.models';
import { StudentPortalService } from '../student-portal.service';

@Component({
  selector: 'app-student-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './enrollments.html',
  styleUrl: './enrollments.css',
})
export class StudentEnrollments implements OnInit {
  private readonly portalService = inject(StudentPortalService);

  enrollments = signal<StudentEnrollmentItem[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  // Cancellation Modal State
  cancelTarget = signal<StudentEnrollmentItem | null>(null);
  cancelReason = '';
  isSubmittingCancel = signal(false);
  cancelError = signal('');

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.portalService.getMyEnrollments(1, 100).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : res.items ?? [];
        this.enrollments.set(list);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message || 'Unable to load your enrollments.');
        this.isLoading.set(false);
      },
    });
  }

  canRequestCancellation(status: string | number): boolean {
    return status === 0 || status === 'Enrolled' || status === 'Active';
  }

  formatStatus(status: string | number): string {
    if (status === 0 || status === 'Enrolled' || status === 'Active') return 'Enrolled';
    if (status === 1 || status === 'Cancelled' || status === 'Dropped') return 'Cancelled';
    if (status === 2 || status === 'Completed') return 'Completed';
    return String(status);
  }

  openCancelModal(item: StudentEnrollmentItem): void {
    this.cancelTarget.set(item);
    this.cancelReason = '';
    this.cancelError.set('');
    this.successMessage.set('');
  }

  closeCancelModal(): void {
    this.cancelTarget.set(null);
    this.cancelReason = '';
    this.cancelError.set('');
  }

  submitCancellation(): void {
    const target = this.cancelTarget();
    if (!target) return;

    if (!this.cancelReason.trim()) {
      this.cancelError.set('Please enter a reason for cancellation.');
      return;
    }

    this.isSubmittingCancel.set(true);
    this.cancelError.set('');

    this.portalService
      .requestCancellation(target.enrollmentId, this.cancelReason.trim())
      .subscribe({
        next: () => {
          this.isSubmittingCancel.set(false);
          this.closeCancelModal();
          this.successMessage.set(
            `Cancellation request submitted for ${target.courseName}.`,
          );
          this.loadEnrollments();
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmittingCancel.set(false);
          const validationErrors = err.error?.errors
            ? Object.values(err.error.errors).flat().join(' ')
            : '';
          this.cancelError.set(
            validationErrors ||
              err.error?.detail ||
              err.error?.message ||
              'Unable to submit cancellation request.',
          );
        },
      });
  }
}