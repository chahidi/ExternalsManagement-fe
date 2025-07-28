import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/question';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PromptService {
    private apiUrl = `${environment.apiInterviews}/v1/prompt`;

    constructor(private http: HttpClient) { }

    getQuestions = (promptId: number, token: string): Observable<Question[]> => {
        const payload = {
            promptId,
            token
        };

        console.log('PromptService sending payload:', payload);

        return this.http.post<Question[]>(`${this.apiUrl}/generateQuestions`, payload);
    };
}
