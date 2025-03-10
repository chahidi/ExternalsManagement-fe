import { Routes } from '@angular/router';
import { LayoutComponent } from './app/shared/layout/layout.component';
import { DashboardComponent } from './app/features/dashboard/dashboard.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', component: DashboardComponent },
            { path: 'features', loadChildren: () => import('./app/features/pages.routes') }
        ]
    },
    { path: 'auth', loadChildren: () => import('./app/features/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
