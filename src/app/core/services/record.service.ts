import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InterviewRecord } from '../models/interview-record';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RecordService {
    // Mockoon endpoint
    private apiUrl = `${environment.apiInterviews}/records`;


  constructor(private http: HttpClient) {}

  saveRecord(record: InterviewRecord): Observable<InterviewRecord> {
    return this.http.post<InterviewRecord>(this.apiUrl, record);
  }
}
