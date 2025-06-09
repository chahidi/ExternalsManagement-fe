import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterviewInstance } from '../models/interview-instance';
import { environment } from '../../../environments/environment';
import { InterviewRecord } from '../models/interview-record';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  
  private apiUrl = `${environment.apiInterviews}/interviews`;
  constructor(private http: HttpClient) {}

  getInterviews(): Observable<InterviewInstance[]> {
    return this.http.get<InterviewInstance[]>(this.apiUrl);
  }

  generateNewLink(interviewId: string): Observable<{
    id: number;
    candidateId: number;
    newLink: string;
  }> {
    return this.http.post<{
      id: number;
      candidateId: number;
      newLink: string;
    }>(`${this.apiUrl}/${interviewId}/generate-link`, {});
  }
  sendMail(to: string, subject: string, body: string): Observable<any> {
    const payload = {
      to: to,
      subject: subject,
      body: body
    };

    return this.http.post(`${this.apiUrl}/send-mail`, payload);
  }
  deleteInterview(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

}
