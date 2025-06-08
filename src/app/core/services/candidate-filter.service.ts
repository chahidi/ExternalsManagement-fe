import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Candidate } from '../models/candidate';
import { environment } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CandidateFilterService {
  private readonly baseUrl = `${environment.apiUrl}/candidates`;

  constructor(private http: HttpClient) { }

  filterCandidates(filters: any): Observable<Candidate[]> {
    console.log('Filtering with params:', filters);

    // doing the filter just locally instead of something more complicated
    return this.http.get<Candidate[]>(this.baseUrl).pipe(
      map(candidates => {
        console.log('All candidates loaded:', candidates.length);
        let filteredCandidates = [...candidates];

        // Filter by skills
        if (filters.skills && filters.skills.length > 0) {
          console.log('Filtering by skills');
          const selectedSkills = filters.skills.map((skill: any) => skill.code.toLowerCase());

          filteredCandidates = filteredCandidates.filter(candidate => {
            if (!candidate.skills || !candidate.skills.length) return false;

            // Check if the candidate has at least one of the selected skills
            return candidate.skills.some(skill => {
              return skill.skillName && selectedSkills.includes(skill.skillName.toLowerCase());
            });
          });

          console.log('After skills filter:', filteredCandidates.length);
        }

        // Filter by language
        if (filters.language) {
          console.log('Filtering by language:', filters.language.code);

          filteredCandidates = filteredCandidates.filter(candidate => {
            if (!candidate.naturalLanguages || !candidate.naturalLanguages.length) return false;

            // Check if any of the candidate's languages match the selected language
            // Try multiple language fields to increase the chance of a match
            return candidate.naturalLanguages.some(lang => {
              if (!lang) return false;

              const searchLanguage = filters.language.code.toLowerCase();

              // Check multiple fields for matching language
              return (
                (lang.language && lang.language.toLowerCase() === searchLanguage) ||
                (lang.languageInEnglish && lang.languageInEnglish.toLowerCase() === searchLanguage) ||
                (lang.englishDescription && lang.englishDescription.toLowerCase() === searchLanguage)
              );
            });
          });

          console.log('After language filter:', filteredCandidates.length);
        }

        // Filter by years of experience
        if (filters.yearsOfExperience !== null && filters.yearsOfExperience !== undefined) {
          console.log('Filtering by experience:', filters.yearsOfExperience);
          const targetYears = Number(filters.yearsOfExperience);

          filteredCandidates = filteredCandidates.filter(candidate => {
            if (candidate.yearsOfExperience === undefined || candidate.yearsOfExperience === null) return false;

            // Convert to number for proper comparison
            const candidateYears = Number(candidate.yearsOfExperience);

            // Use greater than or equal comparison instead of exact match
            return candidateYears >= targetYears;
          });

          console.log('After experience filter:', filteredCandidates.length);
        }

        return filteredCandidates;
      }),
      catchError(error => {
        console.error('Error while filtering candidates:', error);
        return of([]);
      })
    );
  }
}
