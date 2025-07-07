import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Candidate } from '../models/candidate';
import { environment } from '../../../environments/environment';
import { Question } from '../models/question';
import { Evaluation } from '../models/evaluation';

@Injectable({
  providedIn: 'root'
})
export class InterviewEvaluationService {

  private baseUrl = `${environment.apiUrl}/v1/interview`;
  private apiUrl = `${environment.apiInterviews}/v1/interview`;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error || error.message}`;
      if (error.status === 404) {
        errorMessage = 'Candidate not found';
      } else if (error.status === 400) {
        errorMessage = 'Invalid input';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error';
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  getInterviewEvaluation(prompt: string, questions: Question[]): Observable<Evaluation> {
    const body = { prompt, questions };
    return this.http.post<Evaluation>(`${this.apiUrl}/evaluation`, body)
      .pipe(catchError(this.handleError));
  }

}

