import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Offer } from '../models/offer';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private baseUrl = `${environment.apiUrl}/v1/offers`;
  private apiUrl = `${environment.apiInterviews}/v1/offers`;

  constructor(private http: HttpClient) { }


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


  getAllTitles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/titles`);
  }

}

