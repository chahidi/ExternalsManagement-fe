import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
   private activeRequests = 0;
   private isLoading = new BehaviorSubject<boolean>(false);
   private loadingMessage = new BehaviorSubject<string | null>(null);

   isLoading$ = this.isLoading.asObservable();
   loadingMessage$ = this.loadingMessage.asObservable();

   show(message?: string) {
       this.activeRequests++;
       this.loadingMessage.next(message || null);
       this.isLoading.next(true);
   }

   hide() {
       this.activeRequests--;
       if (this.activeRequests <= 0) {
           this.activeRequests = 0;
           this.isLoading.next(false);
           this.loadingMessage.next(null);}
   }
}
