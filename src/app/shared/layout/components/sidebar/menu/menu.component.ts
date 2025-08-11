import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from '../menuitem/menu-item.component';
@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [MenuItemComponent, RouterModule],
    templateUrl: './menu.component.html'
})
export class MenuComponent {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/'] }]
            },
            {
                label: 'Candidates',
                items: [
                    { label: 'New CV', icon: 'pi pi-fw pi-user-plus', routerLink: ['/candidates/new-cv'] },
                    { label: 'Candidate List', icon: 'pi pi-fw pi-list', routerLink: ['/candidates/candidate-list'] }
                ]
            },
            {
                label: 'Prompt Management',
                items: [
                    { label: 'New Prompt', icon: 'pi pi-fw pi-microchip-ai', routerLink: ['/prompts/new-prompt'] },
                    { label: 'Prompt List', icon: 'pi pi-fw pi-list', routerLink: ['/prompts/prompt-list'] }
                ]
            },
            {
                label: 'Interviews Management',
                items: [
                    { label: 'Interview List', icon: 'pi pi-fw pi-list', routerLink: ['/interviews/interview-list'] },
                ]
            }
        ];
    }
}
