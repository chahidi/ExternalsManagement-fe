import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
<<<<<<< interviews-adjust
import { Record } from '../models/record';
=======
import { InterviewRecord } from '../models/interview-record';
>>>>>>> interviews-develop
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RecordService {
    // Mockoon endpoint
    private apiUrl = `${environment.apiInterviews}/records`;


  constructor(private http: HttpClient) {}

<<<<<<< interviews-adjust
  saveRecord(record: Record): Observable<Record> {
    return this.http.post<Record>(this.apiUrl, record);
=======
  saveRecord(record: InterviewRecord): Observable<InterviewRecord> {
    return this.http.post<InterviewRecord>(this.apiUrl, record);
>>>>>>> interviews-develop
  }
}
