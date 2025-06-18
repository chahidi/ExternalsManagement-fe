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

  deleteInterview(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }


  generateNewLink(interviewId: string): Observable<{
    linkId: number;
    newLink: string;
    generationCount: number;
  }> {
    return this.http.post<{
      linkId: number;
      newLink: string;
      generationCount: number;
    }>(`${this.apiUrl}/${interviewId}/link`, {});
  }
  sendEmail(interviewId: string): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/${interviewId}/send-email`,
    {}
  );
}
 AddComment(id: string, interview: InterviewInstance) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, interview);
  }

}
