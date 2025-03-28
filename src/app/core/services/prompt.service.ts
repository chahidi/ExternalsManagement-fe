// prompt.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prompt } from '../models/prompt'; 

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private apiUrl = '/api/v1/prompts';

  constructor(private http: HttpClient) {}

  createPrompt(prompt: Prompt): Observable<Prompt> {
    return this.http.post<Prompt>(this.apiUrl, prompt);
  }

  getPrompt(id: string): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.apiUrl}/${id}`);
  }

  getAllPrompts(): Observable<Prompt[]> {
    return this.http.get<Prompt[]>(this.apiUrl);
  }

  getAllPromptsPaginated(page: number, size: number, sortField?: string, sortOrder?: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortField && sortOrder !== undefined) {
      params = params.set('sort', `${sortField},${sortOrder === 1 ? 'asc' : 'desc'}`);
    }

    return this.http.get<any>(`${this.apiUrl}/paginated`, { params });
  }

  updatePrompt(id: string, prompt: Prompt): Observable<Prompt> {
    return this.http.put<Prompt>(`${this.apiUrl}/${id}`, prompt);
  }

  deletePrompt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}