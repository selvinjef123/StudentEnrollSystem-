import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResult } from '../../../shared/models/paged-result.model';
import {
  CancellationQuery,
  CancellationResponse,
  ReviewCancellationRequest,
} from './cancellation-request.models';

@Injectable({
  providedIn: 'root',
})
export class CancellationRequestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cancellation-requests`;

  getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    query?: CancellationQuery,
  ): Observable<PagedResult<CancellationResponse>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (query) {
      if (query.search?.trim()) {
        params = params.set('search', query.search.trim());
      }
      if (query.courseId !== null && query.courseId !== undefined) {
        params = params.set('courseId', query.courseId);
      }
      if (query.status !== null && query.status !== undefined && query.status !== '') {
        params = params.set('status', query.status);
      }
      if (query.fromDate) {
        params = params.set('fromDate', query.fromDate);
      }
      if (query.toDate) {
        params = params.set('toDate', query.toDate);
      }
    }

    return this.http.get<PagedResult<CancellationResponse>>(this.apiUrl, { params });
  }

  approve(id: number, request: ReviewCancellationRequest): Observable<CancellationResponse> {
    return this.http.put<CancellationResponse>(`${this.apiUrl}/${id}/approve`, request);
  }

  reject(id: number, request: ReviewCancellationRequest): Observable<CancellationResponse> {
    return this.http.put<CancellationResponse>(`${this.apiUrl}/${id}/reject`, request);
  }
}