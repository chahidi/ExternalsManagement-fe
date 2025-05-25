import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, FormsModule,TranslateModule],
    styleUrl: './topbar.component.scss',
    templateUrl: './topbar.component.html'
})

export class AppTopbar {
    items!: MenuItem[];
    currentLang: string;
    showLanguageMenu: boolean = false;

    constructor(
        public layoutService: LayoutService,
        private translate: TranslateService
    ) {
        const savedLang = localStorage.getItem('userLanguage');
        this.currentLang = savedLang || this.translate.currentLang || 'en';
        if (savedLang) {
            this.translate.use(savedLang);
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    toggleLanguageMenu() {
        this.showLanguageMenu = !this.showLanguageMenu;
    }

    changeLanguage(lang: string) {
        this.currentLang = lang;
        localStorage.setItem('userLanguage', lang);
        this.translate.use(lang);
        this.showLanguageMenu = false;
    }
}
