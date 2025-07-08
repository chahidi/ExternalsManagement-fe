import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Question } from '../models/question';
import { Evaluation } from '../models/evaluation';
import { handleError } from '../constants/http-const';

@Injectable({
  providedIn: 'root'
})
export class InterviewEvaluationService {

  private baseUrl = `${environment.apiUrl}/v1/interview`;
  private apiUrl = `${environment.apiInterviews}/v1/interview`;

  constructor(private http: HttpClient) { }


  getInterviewEvaluation(prompt: string, questions: Question[]): Observable<Evaluation> {
    const body = { prompt, questions };
    return this.http.post<Evaluation>(`${this.apiUrl}/evaluation`, body)
      .pipe(catchError((error) => handleError("Interview Evaluation", error)));
  }

}

