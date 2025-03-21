
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewCvService {

  constructor(private http: HttpClient) {}


  uploadCv(payload: { promptCode: string, mimeType: string, b64EFile: string }): Observable<any> {
    return this.http.post('http://localhost:8080/api/v1/cv/extract', payload);
  }
}

