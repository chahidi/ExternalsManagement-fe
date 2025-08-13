import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InterviewInstance } from '../models/interview-instance';
import { CandidateService } from './candidate.service';
import { Offer } from '../models/offer';
import { Question } from '../models/question';

import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private offers: Offer[] = [];               // keep a lightweight cache if you want
  private interviews: InterviewInstance[] = [];
  private questions: Question[] = [];
  private responses: Response[] = [];

  private baseUrl = `${environment.apiUrl}/v1/offers`;
  private apiUrl  = `${environment.apiInterviews}/v1/offers`;

  constructor(
    private http: HttpClient,
    private candidateService: CandidateService
  ) {}

  
  getAllTitles = (): Observable<string[]> => {
    return this.http.get<string[]>(`${this.apiUrl}/titles`);
  };


  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.baseUrl}/all`).pipe(
      tap(offers => { this.offers = offers; }), // optional cache
      catchError(err => {
        console.error('GET /v1/offers/all failed', err);
        return throwError(() => new Error('Failed to load offers'));
      })
    );
  }


  getOfferById(id: string): Observable<Offer> {
    return this.http.get<Offer>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`GET /v1/offers/${id} failed`, err);
        return throwError(() => new Error(`Failed to load offer with ID ${id}`));
      })
    );
  }

  addOffer(offer: Offer): Observable<Offer> {
    return this.http.post<Offer>(this.baseUrl, offer).pipe(
      tap(newOffer => { this.offers.push(newOffer); }) // keep cache in sync (optional)
    );
  }

  updateOffer(offer: Offer): Observable<Offer> {
    return this.http.put<Offer>(`${this.baseUrl}/${offer.id}`, offer).pipe(
      tap(updated => {
        const i = this.offers.findIndex(o => o.id === updated.id);
        if (i !== -1) this.offers[i] = updated;
      })
    );
  }

  deleteOffer(offerId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${offerId}`).pipe(
      tap(() => {
        this.offers = this.offers.filter(o => o.id !== offerId);
        this.interviews = this.interviews.filter(i => i.offer.id !== offerId);
        this.questions = this.questions.filter(q => !this.interviews.some(i => i.id === q.interview.id));
      })
    );
  }
}
