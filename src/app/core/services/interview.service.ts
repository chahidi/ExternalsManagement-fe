import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterviewInstance } from '../models/interview-instance';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://localhost:3000/interviews';

  constructor(private http: HttpClient) {}

  getInterviews(): Observable<InterviewInstance[]> {
    return this.http.get<InterviewInstance[]>(this.apiUrl);
  }
}


/*
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InterviewInstance } from '../models/interview-instance';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  getInterviews() {
    return this.http.get<any[]>(`${this.apiUrl}/interviews`);
  }
}
*/