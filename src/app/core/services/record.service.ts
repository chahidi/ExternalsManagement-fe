import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InterviewRecord } from '../models/interview-record';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private apiUrl = 'http://localhost:3001/records'; // Mockoon endpoint

  constructor(private http: HttpClient) {}

  saveRecord(record: InterviewRecord): Observable<InterviewRecord> {
    return this.http.post<InterviewRecord>(this.apiUrl, record);
  }
}
