import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLanguageSubject = new BehaviorSubject<string>('en');
    public currentLanguage$: Observable<string> = this.currentLanguageSubject.asObservable();

    constructor() {
        const savedLang = localStorage.getItem('app_language');
        if (savedLang) {
            this.currentLanguageSubject.next(savedLang);
        }
    }


    getCurrentLanguage(): string {
        return this.currentLanguageSubject.value;
    }

    setLanguage(lang: string): void {
        this.currentLanguageSubject.next(lang);
        localStorage.setItem('app_language', lang);
    }


    getLanguageObservable(): Observable<string> {
        return this.currentLanguage$;
    }
}
