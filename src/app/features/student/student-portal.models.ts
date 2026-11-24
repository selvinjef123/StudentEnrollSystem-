export interface CourseItem {
  courseId: number;
  courseName: string;
  duration: string;
  fees: number;
  capacity: number;
  enrolledCount: number;
  availableSeats: number;
  isActive: boolean;
}

export interface StudentEnrollmentItem {
  enrollmentId: number;
  studentId?: number;
  studentName?: string;
  courseId: number;
  courseName: string;
  duration?: string;
  fees?: number;
  status: string | number;
  enrolledAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}