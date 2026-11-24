import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CancellationResponse,
  CancellationStatusValue,
} from '../cancellation-request.models';
import { CancellationRequestService } from '../cancellation-request.service';

@Component({
  selector: 'app-cancellation-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cancellation-request-list.html',
  styleUrl: './cancellation-request-list.css',
})
export class CancellationRequestListComponent implements OnInit {
  private readonly cancellationService = inject(CancellationRequestService);

  requests = signal<CancellationResponse[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  pageNumber = signal(1);
  pageSize = signal(10);
  totalRecords = signal(0);
  totalPages = signal(0);

  // Filters
  searchTerm = signal('');
  selectedStatus = signal<string>('');

  // Review Modal State
  reviewTarget = signal<CancellationResponse | null>(null);
  reviewAction = signal<'approve' | 'reject'>('approve');
  adminRemarks = '';
  isSubmittingReview = signal(false);
  reviewError = signal('');

  pendingOnPage = computed(
    () => this.requests().filter((r) => this.isPending(r.status)).length,
  );
  approvedOnPage = computed(
    () => this.requests().filter((r) => this.normalizeStatus(r.status) === 'Approved').length,
  );
  rejectedOnPage = computed(
    () => this.requests().filter((r) => this.normalizeStatus(r.status) === 'Rejected').length,
  );

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.cancellationService
      .getAll(this.pageNumber(), this.pageSize(), {
        search: this.searchTerm(),
        status: this.selectedStatus() || null,
      })
      .subscribe({
        next: (res) => {
          this.requests.set(res.items ?? []);
          this.totalRecords.set(res.totalRecords ?? 0);
          this.totalPages.set(res.totalPages ?? 0);
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(
            err.error?.detail || err.error?.message || 'Unable to load cancellation requests.',
          );
          this.isLoading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadRequests();
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.pageNumber.set(1);
    this.loadRequests();
  }

  openReviewModal(item: CancellationResponse, action: 'approve' | 'reject'): void {
    this.reviewTarget.set(item);
    this.reviewAction.set(action);
    this.adminRemarks = '';
    this.reviewError.set('');
    this.successMessage.set('');
  }

  closeReviewModal(): void {
    this.reviewTarget.set(null);
    this.adminRemarks = '';
    this.reviewError.set('');
  }

  submitReview(): void {
    const target = this.reviewTarget();
    if (!target) return;

    this.isSubmittingReview.set(true);
    this.reviewError.set('');

    const payload = {
      adminRemarks: this.adminRemarks.trim() || null,
    };

    const action = this.reviewAction();
    const request$ =
      action === 'approve'
        ? this.cancellationService.approve(target.cancellationRequestId, payload)
        : this.cancellationService.reject(target.cancellationRequestId, payload);

    request$.subscribe({
      next: () => {
        this.isSubmittingReview.set(false);
        this.closeReviewModal();
        this.successMessage.set(
          action === 'approve'
            ? `Approved cancellation request #${target.cancellationRequestId} for ${target.studentName}.`
            : `Rejected cancellation request #${target.cancellationRequestId} for ${target.studentName}.`,
        );
        this.loadRequests();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmittingReview.set(false);
        const validationErrors = err.error?.errors
          ? Object.values(err.error.errors).flat().join(' ')
          : '';
        this.reviewError.set(
          validationErrors ||
            err.error?.detail ||
            err.error?.message ||
            'Failed to submit review.',
        );
      },
    });
  }

  normalizeStatus(status: CancellationStatusValue): 'Pending' | 'Approved' | 'Rejected' {
    if (status === 0 || status === 'Pending') return 'Pending';
    if (status === 1 || status === 'Approved') return 'Approved';
    return 'Rejected';
  }

  isPending(status: CancellationStatusValue): boolean {
    return this.normalizeStatus(status) === 'Pending';
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.update((p) => p + 1);
      this.loadRequests();
    }
  }

  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.pageNumber.update((p) => p - 1);
      this.loadRequests();
    }
  }
}