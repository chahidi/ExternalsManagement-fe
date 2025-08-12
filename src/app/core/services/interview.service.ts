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
    private readonly apiUrl = `${environment.apiUrl}/v1/interviews`;
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private http: HttpClient) {}

    getInterviews = (): Observable<InterviewInstance[]> => {
        return this.http.get<InterviewInstance[]>(`${this.apiUrl}`).pipe(retry(2), catchError(this.handleError));
    };

    deleteInterview = (id: string): Observable<{ message: string }> => {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(retry(2), catchError(this.handleError));
    };
    generateAndSaveInterviewLink(interview: InterviewInstance): Observable<string> {
        const interviewId = interview.id;

        if (!interviewId || typeof interviewId !== 'string') {
            return throwError(() => new Error(ERROR_MESSAGES.INTERVIEW.INVALID_INTERVIEW_ID));
        }

        this.loadingSubject.next(true);

        return this.http
            .post(`${this.apiUrl}/${interviewId}/generateAndSaveLink`, null, {
                responseType: 'text'
            })
            .pipe(
                timeout(10000),
                retry(2),
                finalize(() => this.loadingSubject.next(false)),
                catchError(this.handleError)
            );
    }

    sendEmail = (interview: InterviewInstance): Observable<string> => {
        const interviewId = interview.id;

        if (!interviewId || typeof interviewId !== 'string' || interviewId.trim() === '') {
            return throwError(() => new Error(ERROR_MESSAGES.EMAIL.INVALID_INTERVIEWID));
        }

        return this.http
            .post(
                `${this.apiUrl}/${interviewId}/sendEmail`,
                {},
                {
                    responseType: 'text'
                }
            )
            .pipe(retry(2), catchError(this.handleError));
    };

    AddComment = (id: string, comment: string): Observable<any> => {
        return this.http.put<any>(`${this.apiUrl}/${id}/addComment`, { comment }).pipe(retry(2), catchError(this.handleError));
    };

    private handleError = (error: HttpErrorResponse): Observable<never> => {
        let errorMessage = ERROR_MESSAGES.INTERVIEW.UNKNOWN;

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            errorMessage = `Server Error (Code ${error.status}): ${error.message}`;
        }

        console.error('[InterviewService Error]', errorMessage);
        return throwError(() => new Error(errorMessage));
    };
}
