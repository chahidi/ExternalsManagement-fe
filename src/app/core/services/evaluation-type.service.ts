import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluationType } from '../models/evaluation-type';
import { environment } from '../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class EvaluationTypeService {
  private apiUrl = `${environment.apiUrl}/v1/evaluation-types`;

  constructor(private http: HttpClient) {}

  getAllEvaluationTypes(): Observable<EvaluationType[]> {
    return this.http.get<EvaluationType[]>(this.apiUrl);
  }

  createEvaluationType(type: EvaluationType): Observable<EvaluationType> {
    return this.http.post<EvaluationType>(this.apiUrl, type);
  }
}
