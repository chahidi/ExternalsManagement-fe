// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class TokenValidationService {
//     private apiUrl = `http://localhost:3001`;


//   constructor(private http: HttpClient) {}

//   validateToken(token: string): Observable<boolean> {
//     return this.http.post<boolean>(`${this.apiUrl}/validateToken`, { token });
//   }

// }


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {

  private apiUrl = `${environment.apiUrl}/v1/interviews`;

  constructor(private http: HttpClient) {}

  validateToken(token: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/token/${token}/validate`);
  }

  getInterviewIdFromToken(token: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/token/${token}/interview-id`);
  }

  getInterviewByToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/token/${token}`);
  }
}
