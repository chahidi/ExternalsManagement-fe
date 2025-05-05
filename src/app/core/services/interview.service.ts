import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterviewInstance } from '../models/interview-instance';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://localhost:3001/interviews';

  constructor(private http: HttpClient) {}

  getInterviews(): Observable<InterviewInstance[]> {
    return this.http.get<InterviewInstance[]>(this.apiUrl);
  }
}
