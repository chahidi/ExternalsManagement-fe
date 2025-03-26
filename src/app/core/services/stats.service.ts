import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:8080/api/candidates/charts';

  constructor(private http: HttpClient) {}

  getTotalCandidates(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/candidates/total`);
  }

  getLanguages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/languages`);
  }

  getCandidatesByLanguage(language: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidates/language/${language}`);
  }

  getSkills(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/technologies`);
  }

  getCandidatesBySkill(skill: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidates/technology/${skill}`);
  }
}
