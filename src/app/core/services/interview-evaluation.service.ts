import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InterviewEvaluationDisplay } from '../models/interview-evaluation-display';
import { Evaluation } from '../models/evaluation';
import { Question } from '../models/question';
import { handleError } from '../constants/http-const';

@Injectable({ providedIn: 'root' })
export class InterviewEvaluationService {
  private readonly interviewsUrl = `${environment.apiUrl}/v1/interviews`;
  private readonly evaluationsUrl = `${environment.apiUrl}/v1/evaluations`;

  constructor(private http: HttpClient) {}

  getInterviewEvaluations(interviewId: string): Observable<InterviewEvaluationDisplay> {
    return this.http
      .get<InterviewEvaluationDisplay>(`${this.interviewsUrl}/${interviewId}/evaluations`)
      .pipe(retry(2), catchError(err => handleError('Fetching Interview Evaluations', err)));
  }

  getSingleEvaluation = (interviewId: string, evaluationId: string): Observable<Evaluation> =>
    this.http.get<Evaluation>(`${this.interviewsUrl}/${interviewId}/evaluations/${evaluationId}`)
      .pipe(retry(2), catchError(err => handleError('Fetching Single Evaluation', err)));

  getEvaluationsByType = (interviewId: string, evaluationTypeId: string): Observable<Evaluation[]> =>
    this.http.get<Evaluation[]>(`${this.interviewsUrl}/${interviewId}/evaluations?type=${evaluationTypeId}`)
      .pipe(retry(2), catchError(err => handleError('Fetching Evaluations by Type', err)));

  prepareInterviewEvaluation = (prompt: string, questions: Question[]): Observable<Evaluation> =>
    this.http.post<Evaluation>(`${this.evaluationsUrl}/evaluation`, { prompt, questions })
      .pipe(retry(2), catchError(err => handleError('Saving Interview Evaluation', err)));
}
