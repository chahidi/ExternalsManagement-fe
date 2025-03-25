import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  readonly baseUrl = `${environment.apiUrl}/v1/candidates`;


  constructor(private http: HttpClient) { }


  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.baseUrl}`);
  }

  getCandidateById(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.baseUrl}/${id}`);
  }

  createCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.baseUrl}`, candidate);
  }

  updateCandidate(id: string, candidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.baseUrl}/${id}`, candidate);
  }

  deleteCandidate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
