// HTTP Status codes for ElevenLabs API
import { HttpConfig } from '../api/http-config';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';



export const HTTP_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'audio/mpeg',
  'User-Agent': 'Angular-ElevenLabs-Client/1.0'
} as const;


export const HTTP_CONFIG: HttpConfig = {
  baseUrl: '',
  timeout: 30000,
  retryAttempts: 2,
  retryDelay: 1000,
};

export function handleError(entity: string,error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An error occurred';
  if (error.error instanceof ErrorEvent) {
    errorMessage = `Error: ${error.error.message}`;
  } else {
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.error || error.message}`;
    if (error.status === 404) {
      errorMessage = entity+' not found';
    } else if (error.status === 400) {
      errorMessage = 'Invalid input';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error';
    }
  }

  return throwError(() => new Error(errorMessage));
}


