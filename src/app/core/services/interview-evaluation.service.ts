import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Question } from '../models/question';
import { Evaluation } from '../models/evaluation';
import { handleError } from '../constants/http-const';

@Injectable({
  providedIn: 'root'
})
export class InterviewEvaluationService {

  private baseUrl = `${environment.apiUrl}/v1/interviews`;
  private apiUrl = `${environment.apiInterviews}/v1/interviews`;

  constructor(private http: HttpClient) { }

  // Updated to return array of evaluations instead of single evaluation
  getInterviewEvaluations = (interviewId: string): Observable<Evaluation[]> => {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/${interviewId}/evaluations/`)
      .pipe(
        retry(2),
        catchError((error) => handleError("Fetching Interview Evaluations", error))
      );
  };

  // Get single evaluation by ID (if needed for specific evaluation)
  getSingleEvaluation = (interviewId: string, evaluationId: string): Observable<Evaluation> => {
    return this.http.get<Evaluation>(`${this.apiUrl}/${interviewId}/evaluations/${evaluationId}`)
      .pipe(
        retry(2),
        catchError((error) => handleError("Fetching Single Evaluation", error))
      );
  };

  // Get evaluations by type
  getEvaluationsByType = (interviewId: string, evaluationTypeId: string): Observable<Evaluation[]> => {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/${interviewId}/evaluations?type=${evaluationTypeId}`)
      .pipe(
        retry(2),
        catchError((error) => handleError("Fetching Evaluations by Type", error))
      );
  };

  prepareInterviewEvaluation = (prompt: string, questions: Question[]): Observable<Evaluation> => {
    const body = { prompt, questions };
    return this.http.post<Evaluation>(`${this.apiUrl}/evaluation`, body)
      .pipe(
        retry(2),
        catchError((error) => handleError("Saving Interview Evaluation", error))
      );
  };

  // Create multiple evaluations for an interview
  createMultipleEvaluations = (interviewId: string, evaluations: Partial<Evaluation>[]): Observable<Evaluation[]> => {
    return this.http.post<Evaluation[]>(`${this.apiUrl}/${interviewId}/evaluations`, { evaluations })
      .pipe(
        retry(2),
        catchError((error) => handleError("Creating Multiple Evaluations", error))
      );
  };

  // Update a specific evaluation
  updateEvaluation = (interviewId: string, evaluationId: string, evaluation: Partial<Evaluation>): Observable<Evaluation> => {
    return this.http.put<Evaluation>(`${this.apiUrl}/${interviewId}/evaluations/${evaluationId}`, evaluation)
      .pipe(
        retry(2),
        catchError((error) => handleError("Updating Evaluation", error))
      );
  };

  // Delete a specific evaluation
  deleteEvaluation = (interviewId: string, evaluationId: string): Observable<{ message: string }> => {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${interviewId}/evaluations/${evaluationId}`)
      .pipe(
        retry(2),
        catchError((error) => handleError("Deleting Evaluation", error))
      );
  };
}
