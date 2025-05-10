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
  private apiUrl = 'http://localhost:8080/candidates';

  constructor(private http: HttpClient) {}

  private baseUrl = `${environment.apiUrl}/v1/candidates`;
  private all = 'all';
  constructor(private http: HttpClient) { }


  // Récupérer tous les candidats
  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/all`).pipe(
      map(candidates => candidates.map(this.transformCandidate)),
      catchError(this.handleError)
    );
  }

  // Récupérer un candidat par ID
  getCandidate(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`).pipe(
      map(this.transformCandidate),
      catchError(this.handleError)
    );
  }

  // Mettre à jour un candidat
  updateCandidate(id: string, candidate: Candidate): Observable<Candidate> {
    const cleanedCandidate = this.cleanCandidate(candidate);
    console.log('data sent to backend:', cleanedCandidate); // Log pour vérifier les données envoyées
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, cleanedCandidate).pipe(
      map(this.transformCandidate),
      catchError(this.handleError)
    );
  }

  // Supprimer un candidat
  deleteCandidate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Nettoyer les références circulaires avant envoi
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

  // Transformer les données du backend
  private transformCandidate(candidate: any): Candidate {
    // console.log('Raw data from backend:', candidate); // Log pour vérifier les données brutes
    console.log(' data from backend:', candidate); // Log pour vérifier les données brutes

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

  // Gérer les erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error || error.message}`;
      if (error.status === 404) {
        errorMessage = 'Candidate not found';
      } else if (error.status === 400) {
        errorMessage = 'Invalid input';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error';
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

  
  deleteCandidate(id: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }) as Observable<string>;
  }
  
  
  
}
