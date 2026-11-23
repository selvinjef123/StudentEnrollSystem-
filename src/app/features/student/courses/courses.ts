import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CourseItem } from '../student-portal.models';
import { StudentPortalService } from '../student-portal.service';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class StudentCourses implements OnInit {
  private readonly portalService = inject(StudentPortalService);

  courses = signal<CourseItem[]>([]);
  enrolledCourseIds = signal<Set<number>>(new Set());
  isLoading = signal(true);
  enrollingCourseId = signal<number | null>(null);
  searchTerm = signal('');
  errorMessage = signal('');
  successMessage = signal('');

  filteredCourses = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();

    return this.courses().filter((course) => {
      if (!course.isActive) return false;
      return (
        !search ||
        course.courseName.toLowerCase().includes(search) ||
        course.duration.toLowerCase().includes(search)
      );
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      coursesRes: this.portalService.getAvailableCourses(1, 100),
      enrollmentsRes: this.portalService.getMyEnrollments(1, 100),
    }).subscribe({
      next: ({ coursesRes, enrollmentsRes }) => {
        const courseList = Array.isArray(coursesRes) ? coursesRes : coursesRes.items ?? [];
        const enrollmentList = Array.isArray(enrollmentsRes)
          ? enrollmentsRes
          : enrollmentsRes.items ?? [];

        this.courses.set(courseList);
        const activeIds = new Set(
          enrollmentList
            .filter((e) => e.status !== 'Cancelled' && e.status !== 'Dropped')
            .map((e) => e.courseId),
        );
        this.enrolledCourseIds.set(activeIds);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message || 'Failed to load available courses.');
        this.isLoading.set(false);
      },
    });
  }

  isEnrolled(courseId: number): boolean {
    return this.enrolledCourseIds().has(courseId);
  }

  isFull(course: CourseItem): boolean {
    return course.availableSeats <= 0 || course.enrolledCount >= course.capacity;
  }

  enroll(course: CourseItem): void {
    this.enrollingCourseId.set(course.courseId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.portalService.enrollInCourse(course.courseId).subscribe({
      next: () => {
        const updatedIds = new Set(this.enrolledCourseIds());
        updatedIds.add(course.courseId);
        this.enrolledCourseIds.set(updatedIds);

        this.courses.update((list) =>
          list.map((c) =>
            c.courseId === course.courseId
              ? {
                  ...c,
                  enrolledCount: c.enrolledCount + 1,
                  availableSeats: Math.max(0, c.availableSeats - 1),
                }
              : c,
          ),
        );

        this.enrollingCourseId.set(null);
        this.successMessage.set(`Successfully enrolled in ${course.courseName}.`);
      },
      error: (err: HttpErrorResponse) => {
        this.enrollingCourseId.set(null);
        this.errorMessage.set(
          err.error?.detail || err.error?.message || 'Unable to enroll in this course.',
        );
      },
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
  }
}