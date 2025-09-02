import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateAnswerRequest {
  questionId: string;
  description: string;
  durationInMinutes: number;
}

export interface AnswerResponse {
  id: string;
  description: string;
  durationInMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private readonly baseUrl = `http://localhost:8080/api/v1/answers`;

  constructor(private http: HttpClient) {}

  createAnswerForQuestion(answerData: CreateAnswerRequest): Observable<AnswerResponse> {
    return this.http.post<AnswerResponse>(`${this.baseUrl}/for-question`, answerData);
  }
}
