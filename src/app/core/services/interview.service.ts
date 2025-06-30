
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, finalize, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InterviewInstance } from '../models/interview-instance';
import {
  GenerateInterviewPayload,
  GenerateInterviewResponse,
  ApiResponse
} from '../models/interview-payload.model';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private readonly apiUrl = `${environment.apiInterviews}/interviews`;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getInterviews(): Observable<InterviewInstance[]> {
    return this.http.get<InterviewInstance[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  deleteInterview(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  generateInterviewLink(interview: InterviewInstance): Observable<GenerateInterviewResponse> {
    const payload: GenerateInterviewPayload = {
      candidateId: interview.candidate.id,
      offerId: interview.offer.id,
      interviewId: interview.id,
      scheduledDate: interview.startedAt
    };

    if (!payload.candidateId || typeof payload.candidateId !== 'string') {
      return throwError(() => new Error('Invalid candidate ID'));
    }
    if (!payload.offerId || typeof payload.offerId !== 'string') {
      return throwError(() => new Error('Invalid offer ID'));
    }
    if (!payload.interviewId || typeof payload.interviewId !== 'number') {
      return throwError(() => new Error('Invalid interview ID'));
    }
    if (!payload.scheduledDate) {
      return throwError(() => new Error('Invalid scheduled date'));
    }

    this.loadingSubject.next(true);

    return this.http.post<GenerateInterviewResponse>(`${this.apiUrl}/generate-link`, payload).pipe(
      timeout(10000),
      retry(2),
      finalize(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }


  sendEmail(interview: InterviewInstance): Observable<{ message: string }> {
    const payload = {
      candidateFullName: interview.candidate.fullName,
      offerTitle: interview.offer.title,
      scheduledDate: interview.startedAt
    };

    return this.http.post<{ message: string }>(`${this.apiUrl}/send-email`, payload)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  AddComment(id: string, interview: InterviewInstance): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, interview)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error (Code ${error.status}): ${error.message}`;
    }

    console.error('[InterviewService Error]', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

