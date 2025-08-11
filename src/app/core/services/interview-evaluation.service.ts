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
  private apiUrl = `${environment.apiUrl}/v1/evaluations`;

  constructor(private http: HttpClient) { }

  getInterviewEvaluations = (interviewId: string): Observable<Evaluation[]> => {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/${interviewId}/evaluations`)
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


    
}
