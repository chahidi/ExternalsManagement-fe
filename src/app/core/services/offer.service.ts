import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Offer } from '../models/offer';
import { environment } from '../../../environments/environment';
import { handleError } from '../constants/http-const';

@Injectable({
    providedIn: 'root'
})
export class OfferService {

    private apiUrl = `${environment.apiUrl}/v1/offers`;

    constructor(private http: HttpClient) { }

    getAllTitles = (): Observable<string[]> => {
        return this.http.get<string[]>(`${this.apiUrl}/titles`);
    };

}
