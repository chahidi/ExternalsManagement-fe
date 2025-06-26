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

  constructor(private http: HttpClient) {}

  getInterviews(): Observable<InterviewInstance[]> {
    return this.http.get<InterviewInstance[]>(this.apiUrl);
  }

  deleteInterview(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  generateNewLink(interview: InterviewInstance): Observable<{
    linkId: number;
    newLink: string;
    generationCount: number;
  }> {
    const payload = {
      candidateId: interview.candidate.id,
      offerId: interview.offer.id,
      interviewId: interview.id,
      scheduledDate: interview.startedAt
    };

    return this.http.post<{
      linkId: number;
      newLink: string;
      generationCount: number;
    }>(`${this.apiUrl}/generate-link`, payload);
  }



  sendEmail(interview: InterviewInstance, linkText: string): Observable<{ message: string }> {
    const payload = {
      candidateFullName: interview.candidate.fullName,
      offerTitle: interview.offer.title,
      scheduledDate: interview.startedAt,
      interviewLinkText: linkText
    };

    return this.http.post<{ message: string }>(`${this.apiUrl}/send-email`, payload);
  }

  AddComment(id: string, interview: InterviewInstance) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, interview);
  }
}
