import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {

  constructor(private translate: TranslateService) {}

  getErrorMessage(key: string, params?: any): string {
    const translationKey = `errors.${key}`;
    return this.translate.instant(translationKey, params);
  }

  // Specific error getters for better type safety
  getEmptyTextError(): string {
    return this.getErrorMessage('emptyText');
  }

  getAudioFailedError(): string {
    return this.getErrorMessage('audioFailed');
  }

  getAudioFailedWithReasonError(reason: string): string {
    return this.getErrorMessage('audioFailedWithReason') + reason;
  }

  getUnknownError(): string {
    return this.getErrorMessage('unknown');
  }

  getGenerateFailError(): string {
    return this.getErrorMessage('generateFail');
  }

  // API errors
  getApiInvalidKeyError(): string {
    return this.getErrorMessage('api.invalidKey');
  }

  getApiInvalidParametersError(): string {
    return this.getErrorMessage('api.invalidParameters');
  }

  getApiRateLimitError(): string {
    return this.getErrorMessage('api.rateLimit');
  }

  getApiServerError(): string {
    return this.getErrorMessage('api.serverError');
  }

  getApiGenericError(status: number): string {
    return this.getErrorMessage('api.generic', { status });
  }

  // Interview errors
  getInterviewInvalidCandidateIdError(): string {
    return this.getErrorMessage('interview.invalidCandidateId');
  }

  getInterviewInvalidOfferIdError(): string {
    return this.getErrorMessage('interview.invalidOfferId');
  }

  getInterviewInvalidInterviewIdError(): string {
    return this.getErrorMessage('interview.invalidInterviewId');
  }

  getInterviewInvalidScheduledDateError(): string {
    return this.getErrorMessage('interview.invalidScheduledDate');
  }

  getInterviewUnknownError(): string {
    return this.getErrorMessage('interview.unknown');
  }

  // Email errors
  getEmailInvalidCandidateNameError(): string {
    return this.getErrorMessage('email.invalidCandidateName');
  }

  getEmailInvalidOfferTitleError(): string {
    return this.getErrorMessage('email.invalidOfferTitle');
  }

  getEmailInvalidScheduledDateError(): string {
    return this.getErrorMessage('email.invalidScheduledDate');
  }

  getEmailInvalidLinkError(): string {
    return this.getErrorMessage('email.invalidLink');
  }

  getEmailInvalidInterviewIdError(): string {
    return this.getErrorMessage('email.invalidInterviewId');
  }
}
