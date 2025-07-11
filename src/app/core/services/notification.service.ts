import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showSuccess(summary: string, detail: string): void {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  showError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  showWarning(summary:string,detail:string):void{
    this.messageService.add({severity:'warn',summary,detail});
  }
}
