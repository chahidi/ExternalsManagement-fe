import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Record } from '../models/record';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RecordService {
  // Mockoon endpoint
  private apiUrl = `${environment.apiInterviews}/recordings`;


  constructor(private http: HttpClient) { }

  saveRecord(record: Record): Observable<Record> {
    return this.http.post<Record>(this.apiUrl, record);
  }
}
