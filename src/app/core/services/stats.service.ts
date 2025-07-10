import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getTotalCandidates(): Observable<number> {
    return this.http.get<any[]>(`${this.baseUrl}/candidates`).pipe(
      map(candidates => candidates.length),
      catchError(() => of(0))
    );
  }

  getLanguages(): Observable<string[]> {
    return this.http.get<{[key: string]: number}>(`${this.baseUrl}/candidates/statistics/languages`).pipe(
      map(stats => Object.keys(stats)),
      catchError(() => of(['English', 'French', 'Arabic', 'Spanish']))
    );
  }

  getCandidatesByLanguage(language: string): Observable<number> {
    // Get the actual count directly from the statistics endpoint
    return this.http.get<{[key: string]: number}>(`${this.baseUrl}/candidates/statistics/languages`).pipe(
      map(stats => stats[language] || 0),
      catchError(() => of(0))
    );
  }

  getSkills(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/candidates/technologies`).pipe(
      catchError(() => of([]))
    );
  }

  getCandidatesBySkill(skill: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/candidates/skills/${skill}`).pipe(
      catchError(() => of([]))
    );
  }

  getExperienceDistribution(): Observable<any> {
    // Create a mock experience distribution since no direct endpoint exists
    return this.http.get<any[]>(`${this.baseUrl}/candidates`).pipe(
      map(candidates => {
        const distribution = this.calculateExperienceDistribution(candidates);
        return {
          experienceDistribution: distribution,
          totalCandidates: candidates.length
        };
      }),
      catchError(() => of({
        experienceDistribution: {},
        totalCandidates: 0
      }))
    );
  }

  private calculateExperienceDistribution(candidates: any[]): any {
    // Create experience distribution based on candidates data
    const distribution: {[key: string]: number} = {};

    candidates.forEach(candidate => {
      const yearsExp = candidate.yearsOfExperience || 0;
      const range = yearsExp > 10 ? '10+' : yearsExp.toString();

      if (distribution[range]) {
        distribution[range]++;
      } else {
        distribution[range] = 1;
      }
    });

    return distribution;
  }
}
