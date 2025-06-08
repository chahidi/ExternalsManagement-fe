import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewCvService {

  readonly apiUrl = `${environment.apiUrl}/cv`;

  constructor(private http: HttpClient) {}

  uploadCv(payload: { promptCode: string, mimeType: string, b64EFile: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/extract`, payload);
  }
}
