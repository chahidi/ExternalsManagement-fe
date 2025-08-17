import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmationModalService {

  private confirmationService: any = null;

  setConfirmationService(confirmationService: any) {
    this.confirmationService = confirmationService;
  }

  private getConfirmationService(): any {
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
