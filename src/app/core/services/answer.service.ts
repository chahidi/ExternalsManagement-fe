import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateAnswerRequest {
  questionId: string;
  description: string;
  durationInMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private readonly baseUrl = `http://localhost:3001/answers`;

  constructor(private http: HttpClient) {}

  createAnswer(answerData: CreateAnswerRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, answerData);
  }
}
