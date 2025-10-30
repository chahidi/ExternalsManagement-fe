import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { Subscription } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-footer',
    imports: [CommonModule, TranslateModule],
    templateUrl: 'footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy {
    currentYear: number = new Date().getFullYear();
    private languageSubscription?: Subscription;

    constructor(
        private translate: TranslateService,
        private languageService: LanguageService
    ) {}

    ngOnInit() {
        const currentLang = this.languageService.getCurrentLanguage();
        this.translate.use(currentLang);
        this.languageSubscription = this.languageService.getLanguageObservable().subscribe((lang) => {
            this.translate.use(lang);
        });
    }

    ngOnDestroy() {
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }
    }
}
