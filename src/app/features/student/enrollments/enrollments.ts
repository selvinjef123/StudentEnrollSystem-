
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentEnrollmentItem } from '../student-portal.models';
import { StudentPortalService } from '../student-portal.service';

@Component({
  selector: 'app-student-enrollments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './enrollments.html',
  styleUrl: './enrollments.css',
})
export class StudentEnrollments implements OnInit {
  private readonly portalService = inject(StudentPortalService);

  enrollments = signal<StudentEnrollmentItem[]>([]);
  isLoading = signal(true);
  droppingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

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

  dropCourse(item: StudentEnrollmentItem): void {
    this.droppingId.set(item.enrollmentId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.portalService.dropEnrollment(item.enrollmentId).subscribe({
      next: () => {
        this.enrollments.update((list) =>
          list.filter((e) => e.enrollmentId !== item.enrollmentId),
        );
        this.droppingId.set(null);
        this.successMessage.set(`Dropped ${item.courseName}.`);
      },
      error: (err: HttpErrorResponse) => {
        this.droppingId.set(null);
        this.errorMessage.set(
          err.error?.detail || err.error?.message || 'Unable to drop this enrollment.',
        );
      },
    });
  }
}