import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterviewInstance } from '../models/interview-instance';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = `${environment.apiInterviews}/interviews`;

  constructor(private http: HttpClient) { }

  getInterviews(): Observable<InterviewInstance[]> {
    return this.http.get<InterviewInstance[]>(this.apiUrl);
  }

  generateNewLink(interviewId: string): Observable<{
    linkId: number;
    newLink: string;
  }> {
    return this.http.post<{
      linkId: number;
      newLink: string;
    }>(`${this.apiUrl}/${interviewId}/generate-link`, {});
  }

  sendMail(to: string, subject: string, body: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-mail`, { to, subject, body });
  }

  AddComment(id: string, interview: InterviewInstance) {
    return this.http.put<any>(`http://localhost:3001/interviews/${id}`, interview);
  }

  deleteInterview(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
