import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { CandidateService } from './candidate.service';
import { Offer } from '../models/offer';
import { Interview } from '../models/interview';
import { Question } from '../models/question';
import { Response } from '../models/response';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap, first, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private offers: Offer[] = [];
  private interviews: Interview[] = [];
  private questions: Question[] = [];
  private responses: Response[] = [];
  private baseUrl = `${environment.apiUrl}/offers`;
  private dataLoaded = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private candidateService: CandidateService
  ) {
    this.loadOffersFromBackend(); // Initialize on service creation
  }

  isDataLoaded(): Observable<boolean> {
    return this.dataLoaded.asObservable();
  }

  // Wait for data to be loaded
  waitForDataLoaded(): Observable<boolean> {
    return this.isDataLoaded().pipe(
      filter(loaded => loaded),
      first()
    );
  }

  loadOffersFromBackend(): void {
    this.http.get<Offer[]>(`${this.baseUrl}/all`).pipe(
      tap(offers => {
        this.offers = offers;
        this.generateRelatedFakerData();
      }),
      catchError(err => {
        console.error('Failed to load offers from backend', err);
        return throwError(() => new Error('Failed to load offers from backend'));
      })
    ).subscribe();
  }

  private generateRelatedFakerData(): void {
    this.candidateService.getCandidates().pipe(
      catchError(err => {
        console.error('Failed to load candidates from backend', err);
        return throwError(() => new Error('Failed to load candidates from backend'));
      })
    ).subscribe({
      next: candidates => {
        if (!candidates || candidates.length === 0) {
          console.error('No candidates available for generating fake interviews');
          this.dataLoaded.next(true); 
          return;
        }

        this.interviews = [];
        this.questions = [];
        this.responses = [];

        for (const offer of this.offers) {
          const numInterviews = faker.number.int({ min: 1, max: 2 });
          for (let j = 0; j < numInterviews; j++) {
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
            const interview: Interview = {
              id: crypto.randomUUID(),
              offer: offer,
              candidate: randomCandidate,
              sheduledDate: faker.date.soon().toISOString(),
              status: faker.helpers.arrayElement(['scheduled', 'completed'])
            };
            this.interviews.push(interview);

            const numQuestions = faker.number.int({ min: 2, max: 3 });
            for (let q = 0; q < numQuestions; q++) {
              const question: Question = {
                id: crypto.randomUUID(),
                description: faker.lorem.sentence(3),
                interview: interview
              };
              this.questions.push(question);

              const numResponses = faker.number.int({ min: 1, max: 2 });
              for (let r = 0; r < numResponses; r++) {
                this.responses.push({
                  id: crypto.randomUUID(),
                  description: faker.lorem.sentence(3),
                  question: question
                });
              }
            }
          }
        }
        console.log('Generated interviews:', this.interviews);
        console.log('Generated questions:', this.questions);
        console.log('Generated responses:', this.responses);
        this.dataLoaded.next(true); // Mark data as loaded
      },
      error: err => {
        console.error('Error in generateRelatedFakerData:', err);
        this.dataLoaded.next(true); // Mark as loaded even on error to unblock
      }
    });
  }

  getOffers(): Observable<Offer[]> {
    return this.waitForDataLoaded().pipe(
      switchMap(() => of(this.offers)),
      catchError(err => {
        console.error('Backend /all failed', err);
        return throwError(() => new Error('Failed to load offers'));
      })
    );
  }

  getOfferById(id: string): Observable<Offer> {
    return this.waitForDataLoaded().pipe(
      switchMap(() => {
        const offer = this.offers.find(o => o.id === id);
        if (offer) {
          return of(offer);
        }
        return throwError(() => new Error(`Offer with ID ${id} not found`));
      }),
      catchError(err => {
        console.error(`Backend /${id} failed`, err);
        return throwError(() => new Error(`Failed to load offer with ID ${id}`));
      })
    );
  }

  addOffer(offer: Offer): Observable<Offer> {
    return this.http.post<Offer>(this.baseUrl, offer).pipe(
      tap(newOffer => {
        this.offers.push(newOffer);
        this.generateRelatedFakerData();
      })
    );
  }

  updateOffer(offer: Offer): Observable<Offer> {
    return this.http.put<Offer>(`${this.baseUrl}/${offer.id}`, offer).pipe(
      tap(updatedOffer => {
        const index = this.offers.findIndex(o => o.id === updatedOffer.id);
        if (index !== -1) {
          this.offers[index] = updatedOffer;
        }
      })
    );
  }

  deleteOffer(offerId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${offerId}`).pipe(
      tap(() => {
        this.offers = this.offers.filter(o => o.id !== offerId);
        this.interviews = this.interviews.filter(i => i.offer.id !== offerId);
        this.questions = this.questions.filter(q => !this.interviews.some(i => i.id === q.interview.id));
        this.responses = this.responses.filter(r => !this.questions.some(q => q.id === r.question.id));
      })
    );
  }

  getInterviewsByOfferId(offerId: string): Interview[] {
    return this.interviews.filter(i => i.offer.id === offerId);
  }

  getQuestionsByInterviewId(interviewId: string): Question[] {
    return this.questions.filter(q => q.interview.id === interviewId);
  }

  getResponsesByQuestionId(questionId: string): Response[] {
    return this.responses.filter(r => r.question.id === questionId);
  }
}