import { PagedResult } from '../../../shared/models/paged-result.model';

export type CancellationStatusValue = 0 | 1 | 2 | 'Pending' | 'Approved' | 'Rejected';

export interface CancellationResponse {
  cancellationRequestId: number;
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseName: string;
  reason: string;
  status: CancellationStatusValue;
  requestedAt: string;
  reviewedAt: string | null;
  adminRemarks: string | null;
}

export interface CancellationQuery {
  search?: string;
  courseId?: number | null;
  status?: number | string | null;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface ReviewCancellationRequest {
  adminRemarks?: string | null;
}

export type CancellationPagedResult = PagedResult<CancellationResponse>;