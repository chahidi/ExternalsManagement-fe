import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
   private isLoading = new BehaviorSubject<boolean>(false);
   private loadingMessage = new BehaviorSubject<string | null>(null);

   isLoading$ = this.isLoading.asObservable();
   loadingMessage$ = this.loadingMessage.asObservable();

   show(message?: string) {
       this.loadingMessage.next(message || null);
       this.isLoading.next(true);
   }

   hide() {
       this.isLoading.next(false);
       this.loadingMessage.next(null);
   }
}
