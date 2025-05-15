import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:8080/candidates/charts';

    private baseUrl = `${environment.apiUrl}/candidates/charts`;


  constructor(private http: HttpClient) {}

  getTotalCandidates(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/candidates/total`);
  }

  getLanguages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/languages`);
  }

  getCandidatesByLanguage(language: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/candidates/language/${language}`);
  }

  getSkills(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/technologies`);
  }

  getCandidatesBySkill(skill: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/candidates/technology/${skill}`);
  }

  getExperienceDistribution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/candidates/experience`);
  }
}
