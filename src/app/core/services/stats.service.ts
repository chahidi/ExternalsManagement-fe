import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private baseUrl = `${environment.apiUrl}/candidates/charts`;

  constructor(private http: HttpClient) {}

  getTotalCandidates(): Observable<any> {
    return this.http.get(`${this.baseUrl}/total`).pipe(
      catchError(error => {
        console.error('Error fetching total candidates:', error);
        return of(0);
      })
    );
  }

  getLanguages(): Observable<any> {
    return this.http.get(`${this.baseUrl}/languages`).pipe(
      catchError(error => {
        console.error('Error fetching languages:', error);
        return of([]);
      })
    );
  }

  getCandidatesByLanguage(language: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/language/${language}`).pipe(
      catchError(error => {
        console.error(`Error fetching candidates by language ${language}:`, error);
        return of([]);
      })
    );
  }

  getSkills(): Observable<any> {
    return this.http.get(`${this.baseUrl}/technologies`).pipe(
      catchError(error => {
        console.error('Error fetching skills:', error);
        return of([]);
      })
    );
  }

  getCandidatesBySkill(skill: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/technology/${skill}`).pipe(
      catchError(error => {
        console.error(`Error fetching candidates by skill ${skill}:`, error);
        return of([]);
      })
    );
  }
}