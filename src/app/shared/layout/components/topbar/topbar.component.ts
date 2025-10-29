import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../app/core/services/language.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, TranslateModule],
    styleUrl: './topbar.component.scss',
    templateUrl: './topbar.component.html'
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    currentLang: string = 'en';

    constructor(
        public layoutService: LayoutService,
        private translate: TranslateService,
        private languageService: LanguageService
    ) {}

    ngOnInit() {
        this.currentLang = this.languageService.getCurrentLanguage();
        this.translate.use(this.currentLang);
        this.languageService.getLanguageObservable().subscribe((lang) => {
            this.currentLang = lang;
            this.translate.use(lang);
        });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    switchLanguage(lang: string) {
        // this notifies ALL components
        this.languageService.setLanguage(lang);
        this.translate.use(lang);
        // Update local variable for UI
        this.currentLang = lang;
    }
}
