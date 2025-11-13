import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from '../menuitem/menu-item.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MenuItemComponent, RouterModule, TranslateModule],
    templateUrl: './menu.component.html'
})
export class MenuComponent implements OnInit {
    model: MenuItem[] = [];

    constructor(private translate: TranslateService) {}

    ngOnInit() {
        this.buildMenu();

        this.translate.onLangChange.subscribe(() => {
            this.buildMenu();
        });
    }

    buildMenu() {
        this.model = [
            {
                items: [{
                    label: this.translate.instant('dashboardMenu'),
                    icon: 'pi pi-fw pi-chart-bar',
                    routerLink: ['/']
                }]
            },
            {
                label: this.translate.instant('candidates'),
                items: [
                    {
                        label: this.translate.instant('newCV'),
                        icon: 'pi pi-fw pi-user-plus',
                        routerLink: ['/candidates/new-cv']
                    },
                    {
                        label: this.translate.instant('candidateListMenu'),
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/candidates/candidate-list']
                    }
                ]
            },
            {
                label: this.translate.instant('offerManagement'),
                items: [
                    {
                        label: this.translate.instant('newOfferMenu'),
                        icon: 'pi pi-briefcase',
                        routerLink: ['/offers/new-offer']
                    },
                    {
                        label: this.translate.instant('offerListMenu'),
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/offers']
                    }
                ]
            },
            {
                label: this.translate.instant('promptManagement'),
                items: [
                    {
                        label: this.translate.instant('newPromptMenu'),
                        icon: 'pi pi-fw pi-microchip-ai',
                        routerLink: ['/prompts/new-prompt']
                    },
                    {
                        label: this.translate.instant('promptListMenu'),
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/prompts/prompt-list']
                    }
                ]
            },
            {
                label: this.translate.instant('interviewsManagement'),
                items: [
                    {
                        label: this.translate.instant('interviewListMenu'),
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/interviews/interview-list']
                    }
                ]
            }
        ];
    }
}
