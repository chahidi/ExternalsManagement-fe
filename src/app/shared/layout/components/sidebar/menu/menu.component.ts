import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from '../menuitem/menu-item.component';
@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MenuItemComponent, RouterModule],
    templateUrl: './menu.component.html'
})
export class MenuComponent {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/'] }]
            },
            // {
            //     items: [{
            //         label: 'Login',
            //         icon: 'pi pi-fw pi-sign-in',
            //         routerLink: ['/auth/login']
            //     }]
            // },
            {
                label: 'Externals Management',
                items: [
                    { label: 'Cards View', icon: 'pi pi-fw pi-id-card', routerLink: ['/candidates/card-view'] },
                    { label: 'List View', icon: 'pi pi-fw pi-table', routerLink: ['/candidates/grid-view'] }
                ]
            },
            {
                label: 'Candidates',
                items: [
                    { label: 'New Candidate', icon: 'pi pi-fw pi-user-plus', routerLink: ['/candidates/card-view'] },
                ]
            }
        ];
    }
}
