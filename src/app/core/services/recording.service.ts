import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders , HttpErrorResponse} from '@angular/common/http';
import { Record } from '../models/record';
import { firstValueFrom, Observable, retry, catchError, map ,of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UploadChunkRequest } from '../models/uploadChunkRequest';
import { handleError } from '../constants/http-const';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private maxRetries = 3;
  private retryDelay = 1000;
  private failedRequestsAfterMaxRetries: UploadChunkRequest[] = [];

  private apiUrl = `${environment.apiUrl}/v1/recordings`;


  constructor(private http: HttpClient) { }

  saveRecord(record: Record): Observable<Record> {
    return this.http.post<Record>(this.apiUrl, record);
  }

  uploadChunk = (request: UploadChunkRequest): Observable<string> => {
    const headers = new HttpHeaders();

    const formData = new FormData();
    formData.append('interviewId', request.interviewId);
    formData.append('sequence', request.sequence.toString());
    formData.append('chunk', request.chunk);
    return this.http.post(
      `${this.apiUrl}/upload`,
      formData,
      { responseType: 'text' }
    );
  }

  async uploadChunkWithRetry(request: UploadChunkRequest): Promise<boolean> {
    let retryCount = 0;

    while (retryCount < this.maxRetries) {
      try {
        const response = await firstValueFrom(this.uploadChunk(request));

        return true;
      } catch (err: any) {
        retryCount++;
        console.error(`Failed to upload chunk ${request.sequence}, attempt ${retryCount}:`, err);
        if (retryCount <= this.maxRetries) {
          await this.delay(this.retryDelay * Math.pow(2, retryCount - 1));
        } else {
          const errMsg = typeof err === 'string'
            ? err
            : (err?.error?.message || err?.message || 'Unknown error');
          console.error(errMsg);
          this.failedRequestsAfterMaxRetries.push(request);
          throw Error(errMsg);
        }
      }
    }


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
        throw Error('Unexpected error while retrying chunk: ' + err)
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

  mergeChunks = (interviewId: string, transcript: string, lastChunk: Blob): Observable<string | null> => {
    const formData = new FormData();
    formData.append("interviewId", interviewId)
    formData.append("transcript", transcript)
    formData.append("chunk", lastChunk)

    return this.http.post(
      `${this.apiUrl}/merge`,
      formData,
      { responseType: 'text' }
    ).pipe(
      retry(3),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          console.warn(`Interview not found`);
          return of(null); 
        }
        return handleError("Interview", err); 
      })
    );
    // I passed interview as the entity because in the merge function we fecth the interview not the recording
  }

}
