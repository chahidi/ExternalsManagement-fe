import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Candidate } from '../models/candidate';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private baseUrl = `${environment.apiUrl}/v1/candidates`;
  constructor(private http: HttpClient) {}




  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.baseUrl}`).pipe(

      map(candidates => candidates.map(this.transformCandidate)),
      catchError(this.handleError)
    );
  }

  // Get candidate By id
  getCandidate(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.baseUrl}/${id}`).pipe(
      map(this.transformCandidate),
      catchError(this.handleError)
    );
  }


  updateCandidate(id: string, candidate: Candidate): Observable<Candidate> {
    const cleanedCandidate = this.cleanCandidate(candidate);
    return this.http.put<Candidate>(`${this.baseUrl}/${id}`, cleanedCandidate).pipe(
      map(this.transformCandidate),
      catchError(this.handleError)
    );
  }



  deleteCandidate(id: string): Observable<void> {

    return this.http.delete<void>(`${this.baseUrl}/${id}`, { responseType: 'text' as 'json' }).pipe(
      map(() => undefined),

      catchError(this.handleError)
    );
  }

  private cleanCandidate(candidate: Candidate): Candidate {
    const cleaned = {
      ...candidate,
      addresses: candidate.addresses.map(addr => ({
        ...addr,
        candidate: undefined
      })),
      educations: candidate.educations.map(edu => ({
        ...edu,
        candidate: undefined
      })),
      naturalLanguages: candidate.naturalLanguages.map(lang => ({
        ...lang,
        candidate: undefined
      }))
    };
    return cleaned;
  }


  // transform candidate to Backend
  private transformCandidate(candidate: any): Candidate {

    return {
      ...candidate,
      id: candidate.id.toString(),
      addresses: candidate.address ? [{
      id: candidate.address.id?.toString() || '',
      street: candidate.address.street || '',
      postalCode: candidate.address.postalCode || '',
      fullAddress: candidate.address.fullAddress || '',
      city: candidate.address.city ? {
        id: candidate.address.city.id?.toString() || '',
        name: candidate.address.city.name || '',
        countryId: candidate.address.city.countryId || ''
      } : null,
      country: candidate.address.country ? {
        id: candidate.address.country.id?.toString() || '',
        name: candidate.address.country.name || '',
        englishName: candidate.address.country.englishName || ''
      } : null
}] : []
,
      contacts: candidate.contacts || [],
      experiences: candidate.experiences || [],
      skills: candidate.skills || [],
      educations: (candidate.educations || []).map((edu: any) => ({
        ...edu,
        candidate: undefined
      })),
      naturalLanguages: (candidate.naturalLanguages || []).map((lang: any) => ({
        ...lang,
        candidate: undefined
      }))
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error || error.message}`;
      if (error.status === 404) {
        errorMessage = 'Candidate not found';
      } else if (error.status === 400) {
        errorMessage = 'Invalid input';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error';
      }
    }
   
    return throwError(() => new Error(errorMessage));
  }
}

