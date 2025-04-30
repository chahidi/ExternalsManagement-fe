import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from '../menuitem/menu-item.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MenuItemComponent, RouterModule, TranslateModule],
    templateUrl: './menu.component.html'
})
export class MenuComponent {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                items: [{ label: 'menu.dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/'] }]
            },
            {
                label: 'menu.externalsManagement',
                items: [
                    { label: 'menu.cardsView', icon: 'pi pi-fw pi-id-card', routerLink: ['/candidates/card-view'] },
                    { label: 'menu.listView', icon: 'pi pi-fw pi-table', routerLink: ['/candidates/grid-view'] }
                ]
            },
            {
                label: 'menu.candidates',
                items: [
                    { label: 'menu.newCV', icon: 'pi pi-fw pi-user-plus', routerLink: ['/candidates/new-cv'] },
                    { label: 'menu.candidateList', icon: 'pi pi-fw pi-list', routerLink: ['/candidates/candidate-list'] }
                ]
            },
            {
                label: 'menu.promptManagement',
                items: [
                    { label: 'menu.newPrompt', icon: 'pi pi-fw pi-microchip-ai', routerLink: ['/prompts/new-prompt'] },
                    { label: 'menu.promptList', icon: 'pi pi-fw pi-list', routerLink: ['/prompts/prompt-list'] }
                ]
            }
        ];
    }
    
}
