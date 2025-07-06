import { Routes } from '@angular/router';
import { LayoutComponent } from './app/shared/layout/layout.component';
import { DashboardComponent } from './app/features/dashboard/dashboard.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', component: DashboardComponent },
            { path: 'features', loadChildren: () => import('./app/features/features.routes') }
        ]
    },
    {
        path: 'candidates',
        component: LayoutComponent,
        loadChildren: () => import('./app/features/candidate/candidate-routes').then((m) => m.CANDIDATE_FORMS_ROUTES),
    },
    {
        path : 'offers' ,
        component :LayoutComponent , 
        loadChildren : ()=>import('./app/features/offer/offer-routes').then((m)=>m.OFFER_ROUTES),
    },

    { path: 'auth', loadChildren: () => import('./app/features/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
