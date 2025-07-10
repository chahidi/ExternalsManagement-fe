import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InterviewInstance } from '../models/interview-instance';
import { GenerateInterviewLinkPayload, SendInterviewEmailPayload } from '../api/interview-payload';
import { ERROR_MESSAGES } from '../constants/error-messages.const';

@Injectable({ providedIn: 'root' })
export class InterviewService {
    private readonly apiUrl = `${environment.apiInterviews}/interviews`;
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private http: HttpClient) { }

    getInterviews(): Observable<InterviewInstance[]> {
        return this.http.get<InterviewInstance[]>(this.apiUrl).pipe(retry(2), catchError(this.handleError));
    }

    deleteInterview(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(retry(2), catchError(this.handleError));
    }

    generateInterviewLink(interview: InterviewInstance): Observable<string> {
        const payload: GenerateInterviewLinkPayload = {
            candidateId: interview.candidate.id,
            offerId: interview.offer.id,
            interviewId: interview.id,
            scheduledDate: interview.scheduledAt // ✅ FIXED
        };

        if (!payload.candidateId || typeof payload.candidateId !== 'string') {
            return throwError(() => new Error(ERROR_MESSAGES.INTERVIEW.INVALID_CANDIDATE_ID));
        }
        if (!payload.offerId || typeof payload.offerId !== 'string') {
            return throwError(() => new Error(ERROR_MESSAGES.INTERVIEW.INVALID_OFFER_ID));
        }
        if (!payload.interviewId || typeof payload.interviewId !== 'number') {
            return throwError(() => new Error(ERROR_MESSAGES.INTERVIEW.INVALID_INTERVIEW_ID));
        }
        if (!payload.scheduledDate) {
            return throwError(() => new Error(ERROR_MESSAGES.INTERVIEW.INVALID_SCHEDULED_DATE));
        }

        this.loadingSubject.next(true);

        return this.http.post<string>(`${this.apiUrl}/generate-link`, payload).pipe(
            timeout(10000),
            retry(2),
            finalize(() => this.loadingSubject.next(false)),
            catchError(this.handleError)
        );
    }

    sendEmail(interview: InterviewInstance): Observable<{ message: string }> {
        const payload: SendInterviewEmailPayload = {
            candidateFullName: interview.candidate.fullName,
            offerTitle: interview.offer.title,
            scheduledDate: interview.scheduledAt 
        };

        if (!payload.candidateFullName || typeof payload.candidateFullName !== 'string') {
            return throwError(() => new Error(ERROR_MESSAGES.EMAIL.INVALID_CANDIDATE_NAME));
        }
        if (!payload.offerTitle || typeof payload.offerTitle !== 'string') {
            return throwError(() => new Error(ERROR_MESSAGES.EMAIL.INVALID_OFFER_TITLE));
        }
        if (!payload.scheduledDate || !(payload.scheduledDate instanceof Date || typeof payload.scheduledDate === 'string')) {
            return throwError(() => new Error(ERROR_MESSAGES.EMAIL.INVALID_SCHEDULED_DATE));
        }

        return this.http.post<{ message: string }>(`${this.apiUrl}/send-email`, payload).pipe(retry(2), catchError(this.handleError));
    }

    AddComment(id: string, comment: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, { comment }).pipe(retry(2), catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = ERROR_MESSAGES.INTERVIEW.UNKNOWN;

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            errorMessage = `Server Error (Code ${error.status}): ${error.message}`;
        }

        console.error('[InterviewService Error]', errorMessage);
        return throwError(() => new Error(errorMessage));
    }


    saveInterviewLink(interviewId: number, link: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${interviewId}/savelink`, { link }).pipe(retry(2), catchError(this.handleError));
    }
}
