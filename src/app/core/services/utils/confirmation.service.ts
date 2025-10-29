import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class ConfirmationModalService {

  private confirmationService: ConfirmationService | null = null;

  // Add TranslateService to constructor
  constructor(private translate: TranslateService) {}

  setConfirmationService(confirmationService: ConfirmationService) {
      this.confirmationService = confirmationService;
  }

  private getConfirmationService(): ConfirmationService {
    if (!this.confirmationService) {
      throw new Error('ConfirmationService not set. Call setConfirmationService() first.');
    }
    return this.confirmationService;
  }

  confirm(
    message: string,
    header: string,
    acceptCallback: () => void,
    rejectCallback?: () => void,
    acceptLabel?: string,
    rejectLabel?: string
  ) {
    this.getConfirmationService().confirm({
      message,
      header,
      accept: acceptCallback,
      reject: rejectCallback,
      acceptLabel: acceptLabel || 'Yes', // Default fallback
      rejectLabel: rejectLabel || 'No'   // Default fallback
    });
  }

  confirmUpdate(
    acceptCallback: () => void,
    entityName: string = 'item',
    translations?: {
      title?: string;
      message?: string;
      acceptLabel?: string;
      rejectLabel?: string;
    }
  ) {
    const defaultTitle = this.translate.instant('confirmation.updateTitle');
    const defaultMessage = this.translate.instant('confirmation.updateMessage', { entity: entityName });
    const defaultAccept = this.translate.instant('confirmation.yes');
    const defaultReject = this.translate.instant('confirmation.no');

    this.confirm(
      translations?.message || defaultMessage,
      translations?.title || defaultTitle,
      acceptCallback,
      undefined,
      translations?.acceptLabel || defaultAccept,
      translations?.rejectLabel || defaultReject
    );
  }

  confirmDelete(
    acceptCallback: () => void,
    entityName: string = 'item',
    translations?: {
      title?: string;
      message?: string;
      acceptLabel?: string;
      rejectLabel?: string;
    }
  ) {
    const defaultTitle = this.translate.instant('confirmation.deleteTitle');
    const defaultMessage = this.translate.instant('confirmation.deleteMessage', { entity: entityName });
    const defaultAccept = this.translate.instant('confirmation.yes');
    const defaultReject = this.translate.instant('confirmation.no');

    this.confirm(
      translations?.message || defaultMessage,
      translations?.title || defaultTitle,
      acceptCallback,
      undefined, 
      translations?.acceptLabel || defaultAccept,
      translations?.rejectLabel || defaultReject
    );
  }
}
