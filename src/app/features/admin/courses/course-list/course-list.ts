import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CourseResponse, SaveCourseRequest } from '../course.models';
import { CourseService } from '../course.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);

  // Signals
  courses = signal<CourseResponse[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  pageNumber = signal(1);
  pageSize = signal(10);
  totalRecords = signal(0);
  totalPages = signal(0);

  // Create / Edit Modal State
  isModalOpen = signal(false);
  isSaving = signal(false);
  editingCourseId = signal<number | null>(null);
  formError = signal('');

  courseForm: SaveCourseRequest = this.createEmptyForm();

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.courseService.getCourses(this.pageNumber(), this.pageSize()).subscribe({
      next: (response) => {
        this.courses.set(response.items);
        this.totalRecords.set(response.totalRecords);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage.set('Unable to load courses.');
        this.isLoading.set(false);
      },
    });
  }

  openAddModal(): void {
    this.editingCourseId.set(null);
    this.courseForm = this.createEmptyForm();
    this.formError.set('');
    this.successMessage.set('');
    this.isModalOpen.set(true);
  }

  openEditModal(course: CourseResponse): void {
    this.editingCourseId.set(course.courseId);
    this.courseForm = {
      courseName: course.courseName,
      duration: course.duration,
      fees: course.fees,
      capacity: course.capacity,
      isActive: course.isActive,
    };
    this.formError.set('');
    this.successMessage.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingCourseId.set(null);
    this.formError.set('');
  }

  saveCourse(addAnother = false): void {
    const courseName = this.courseForm.courseName?.trim();
    const duration = this.courseForm.duration?.trim();

    if (!courseName || !duration) {
      this.formError.set('Course name and duration are required.');
      return;
    }
    if (this.courseForm.fees < 0) {
      this.formError.set('Fees cannot be negative.');
      return;
    }
    if (!Number.isInteger(this.courseForm.capacity) || this.courseForm.capacity < 1) {
      this.formError.set('Seat capacity must be at least 1.');
      return;
    }

    this.courseForm.courseName = courseName;
    this.courseForm.duration = duration;
    this.isSaving.set(true);
    this.formError.set('');
    this.successMessage.set('');

    const editId = this.editingCourseId();
    const request$ = editId
      ? this.courseService.updateCourse(editId, this.courseForm)
      : this.courseService.createCourse(this.courseForm);

    request$.subscribe({
      next: (savedCourse) => {
        this.isSaving.set(false);
        if (!editId) {
          this.courses.update((courses) =>
            [savedCourse, ...courses.filter((course) => course.courseId !== savedCourse.courseId)]
              .slice(0, this.pageSize()),
          );
          this.totalRecords.update((total) => total + 1);
        }

        if (editId || !addAnother) {
          this.closeModal();
          this.successMessage.set(
            editId ? 'Course updated successfully.' : 'Course created successfully.',
          );
        } else {
          this.courseForm = this.createEmptyForm();
          this.formError.set('');
          this.successMessage.set(
            'Course created successfully. Add another course below.',
          );
        }
        this.loadCourses();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.formError.set(
          err.error?.detail || err.error?.message || 'Failed to save course.',
        );
      },
    });
  }

  deactivateCourse(course: CourseResponse): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.courseService.deactivateCourse(course.courseId).subscribe({
      next: (res) => {
        this.successMessage.set(res?.message || `${course.courseName} deactivated.`);
        this.loadCourses();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(
          err.error?.detail || err.error?.message || 'Unable to deactivate course.',
        );
      },
    });
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.update((page) => page + 1);
      this.loadCourses();
    }
  }

  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.pageNumber.update((page) => page - 1);
      this.loadCourses();
    }
  }

  private createEmptyForm(): SaveCourseRequest {
    return {
      courseName: '',
      duration: '3 Months',
      fees: 5000,
      capacity: 30,
      isActive: true,
    };
  }
}