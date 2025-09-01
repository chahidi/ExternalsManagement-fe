import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Record } from '../models/record';
import { firstValueFrom, Observable, retry,catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UploadChunkRequest } from '../models/uploadChunkRequest';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private maxRetries = 3;
  private retryDelay = 1000;
  private failedRequestsAfterMaxRetries: UploadChunkRequest[] = [];

  private apiUrl = `${environment.apiInterviews}/v1/recordings`;


  constructor(private http: HttpClient) { }

  saveRecord(record: Record): Observable<Record> {
    return this.http.post<Record>(this.apiUrl, record);
  }

  uploadChunk = (request: UploadChunkRequest): Observable<any> => {
    const headers = new HttpHeaders();

    return this.http.post(
      `${this.apiUrl}/upload`,
      request
    );
  }

  async uploadChunkWithRetry(request: UploadChunkRequest): Promise<boolean> {
    let retryCount = 0;

    while (retryCount < this.maxRetries) {
      try {
        const response = await firstValueFrom(this.uploadChunk(request));

        if (response && response.success) {
          return true;
        } else {
          throw new Error('Server did not confirm success');
        }
      } catch (err: any) {
        retryCount++;
        console.error(`Failed to upload chunk ${request.sequence}, attempt ${retryCount}:`, err);
        if (retryCount <= this.maxRetries) {
          await this.delay(this.retryDelay * Math.pow(2, retryCount - 1));
        } else {
          const errMsg = typeof err === 'string'
            ? err
            : (err?.error?.message || err?.message || 'Unknown error');
        }
      }
    }

    this.failedRequestsAfterMaxRetries.push(request);
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryFailedUploads(): Promise<void> {
    if (this.failedRequestsAfterMaxRetries.length === 0) {
      console.log('No failed uploads to retry.');
      return;
    }

    console.log(`Retrying ${this.failedRequestsAfterMaxRetries.length} failed uploads...`);
    const failedNow: UploadChunkRequest[] = [];

    for (const chunk of this.failedRequestsAfterMaxRetries) {
      try {
        const success = await this.uploadChunkWithRetry(chunk);
        if (!success) {
          failedNow.push(chunk);
        }
      } catch (err) {
        failedNow.push(chunk);
        console.error('Unexpected error while retrying chunk:', err);
        throw Error('Unexpected error while retrying chunk: '+err) 
      }
    }

    this.failedRequestsAfterMaxRetries = failedNow;

    if (this.failedRequestsAfterMaxRetries.length === 0) {
      console.log('All failed uploads retried successfully.');
    } else {
      console.warn(`Still ${this.failedRequestsAfterMaxRetries.length} chunks failed after retry.`);
      throw Error(`Still ${this.failedRequestsAfterMaxRetries.length} chunks failed after retry.`)
    }
  }
}
