import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateFilterService {
  readonly baseUrl = `${environment.apiUrl}/v1/candidates/filter`;

  constructor(private http: HttpClient) { }

  filterCandidates(filters: any): Observable<Candidate[]> {
    let params = new HttpParams();

    if (filters.skills && filters.skills.trim() !== '') {
      params = params.set('skills', filters.skills);
    }

    if (filters.language && filters.language.trim() !== '') {
      params = params.set('language', filters.language);
    }

    if (filters.yearsOfExperience !== null && filters.yearsOfExperience !== undefined) {
      params = params.set('yearsOfExperience', filters.yearsOfExperience.toString());
    }

    return this.http.get<Candidate[]>(this.baseUrl, { params });
  }
}
