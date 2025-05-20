import { Routes } from '@angular/router';
import { LayoutComponent } from './app/shared/layout/layout.component';
import { DashboardComponent } from './app/features/dashboard/dashboard.component';
import('./app/features/public-interview/public-interview.component')

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
        path: 'interviews',
        component: LayoutComponent,
        loadChildren: () => import('./app/features/interviews/interviews.routes').then((m) => m.INTERVIEWS_ROUTES),
    },
    {
        path: 'interview/:token',
        loadComponent: () =>
          import('./app/features/public-interview/public-interview.component').then(m => m.PublicInterviewComponent),
        title: 'Interview Page'
      }
,

    { path: 'auth', loadChildren: () => import('./app/features/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
