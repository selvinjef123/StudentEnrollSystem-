import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseItem, PagedResult, StudentEnrollmentItem } from './student-portal.models';

@Injectable({
  providedIn: 'root',
})
export class StudentPortalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAvailableCourses(
    pageNumber = 1,
    pageSize = 20,
    search = '',
  ): Observable<PagedResult<CourseItem>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('isActive', 'true');

    if (search.trim()) params = params.set('search', search.trim());

    return this.http.get<PagedResult<CourseItem>>(`${this.apiUrl}/courses`, { params });
  }

  getMyEnrollments(pageNumber = 1, pageSize = 50): Observable<PagedResult<StudentEnrollmentItem>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<StudentEnrollmentItem>>(
      `${this.apiUrl}/enrollments/my`,
      { params },
    );
  }

  enrollInCourse(courseId: number): Observable<StudentEnrollmentItem> {
    return this.http.post<StudentEnrollmentItem>(`${this.apiUrl}/enrollments`, { courseId });
  }

  dropEnrollment(enrollmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/enrollments/${enrollmentId}`);
  }
}