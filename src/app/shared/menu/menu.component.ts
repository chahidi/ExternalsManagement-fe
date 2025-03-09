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
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                items: [{
                    label: 'Login',
                    icon: 'pi pi-fw pi-sign-in',
                    routerLink: ['/auth/login']
                }]
            },
            {
                items: [{
                    label: 'Error',
                    icon: 'pi pi-fw pi-times-circle',
                    routerLink: ['/auth/error']
                }]
            },
            {
                
                items: [{
                    label: 'Access Denied',
                    icon: 'pi pi-fw pi-lock',
                    routerLink: ['/auth/access']
                }]
            },
        ];
    }
}
