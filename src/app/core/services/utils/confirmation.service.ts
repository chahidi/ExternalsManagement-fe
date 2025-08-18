import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ConfirmationModalService {

  private confirmationService: ConfirmationService | null = null;

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
    rejectCallback?: () => void
  ) {
    this.getConfirmationService().confirm({
      message,
      header,
      accept: acceptCallback,
      reject: rejectCallback
    });
  }

  confirmUpdate(acceptCallback: () => void, entityName: string = 'item') {
    this.confirm(
      `Are you sure you want to edit this ${entityName}?`,
      'Confirm Update',
      acceptCallback
    );
  }

  confirmDelete(acceptCallback: () => void, entityName: string = 'item') {
    this.confirm(
      `Are you sure you want to delete this ${entityName}?`,
      'Confirm Delete',
      acceptCallback
    );
  }
}
