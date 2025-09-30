import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InterviewInstance } from '../models/interview-instance';
import { CandidateService } from './candidate.service';
import { Offer } from '../models/offer';
import { Question } from '../models/question';

import { Observable, throwError, retry } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OfferFormattedDescription } from '../models/offerFormattedDescription';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private offers: Offer[] = [];               // keep a lightweight cache if you want


  private apiUrl = `${environment.apiUrl}/v1/offers`;

  constructor(
    private http: HttpClient,
    private candidateService: CandidateService
  ) {}


  getAllTitles = (): Observable<string[]> => {
    return this.http.get<string[]>(`${this.apiUrl}/titles`);
  };


  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/all`).pipe(
      tap(offers => { this.offers = offers; }), // optional cache
      catchError(err => {
        console.error('GET /v1/offers/all failed', err);
        return throwError(() => new Error('Failed to load offers'));
      })
    );
  }


  getOfferById(id: string): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`GET /v1/offers/${id} failed`, err);
        return throwError(() => new Error(`Failed to load offer with ID ${id}`));
      })
    );
  }

  addOffer(offer: Offer): Observable<Offer> {
    return this.http.post<Offer>(this.apiUrl, offer).pipe(
      tap(newOffer => { this.offers.push(newOffer); }) // keep cache in sync (optional)
    );
  }

  updateOffer(offer: Offer): Observable<Offer> {
    return this.http.put<Offer>(`${this.apiUrl}/${offer.id}`, offer).pipe(
      tap(updated => {
        const i = this.offers.findIndex(o => o.id === updated.id);
        if (i !== -1) this.offers[i] = updated;
      })
    );
  }

  deleteOffer(offerId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${offerId}`).pipe(
      tap(() => {
        this.offers = this.offers.filter(o => o.id !== offerId);
      })
    );
  }

  getOfferFormattedDescription(offerId: string): Observable<OfferFormattedDescription> {
    return this.http.get<OfferFormattedDescription>(`${this.apiUrl}/${offerId}/formatted-description`)
    .pipe(retry(2));
  }

  prepareOfferFormattedDescription(offerId: string): Observable<OfferFormattedDescription> {
    return this.http.post<OfferFormattedDescription>(`${this.apiUrl}/${offerId}/prepare-formatted-description`,{})
    .pipe(retry(2));
  }

}
