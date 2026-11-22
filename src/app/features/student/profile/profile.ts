import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StudentProfile, UpdateStudentProfileRequest } from './profile.models';
import { StudentProfileService } from './profile.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly profileService = inject(StudentProfileService);

  profile = signal<StudentProfile | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  isEditing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  editForm: UpdateStudentProfileRequest = {
    name: '',
    department: '',
    age: 18,
    cgpa: 0,
  };

  initials = computed(() => {
    const name = this.profile()?.name?.trim() || 'S';
    const parts = name.split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.profileService.getMe().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.resetFormFromProfile(data);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to load your profile.'));
        this.isLoading.set(false);
      },
    });
  }

  enableEdit(): void {
    const current = this.profile();
    if (!current) return;
    this.resetFormFromProfile(current);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    const current = this.profile();
    if (current) {
      this.resetFormFromProfile(current);
    }
    this.errorMessage.set('');
    this.isEditing.set(false);
  }

  saveProfile(): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.profileService.updateMe(this.editForm).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.resetFormFromProfile(updated);
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.successMessage.set('Your profile has been updated successfully.');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          this.getErrorMessage(error, 'Failed to update profile. Please check your inputs.'),
        );
        this.isSaving.set(false);
      },
    });
  }

  statusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Pending Approval';
      case 1:
        return 'Approved';
      case 2:
        return 'Rejected';
      default:
        return 'Active';
    }
  }

  private resetFormFromProfile(data: StudentProfile): void {
    this.editForm = {
      name: data.name,
      department: data.department,
      age: data.age,
      cgpa: data.cgpa,
    };
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body?.detail) {
      return body.detail;
    }
    if (body?.message) {
      return body.message;
    }
    if (body?.title) {
      return body.title;
    }
    return fallback;
  }
}