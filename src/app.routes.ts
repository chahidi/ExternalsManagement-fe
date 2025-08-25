import { Routes } from '@angular/router';
import { LayoutComponent } from './app/shared/layout/layout.component';
import { DashboardComponent } from './app/features/dashboard/dashboard.component';
import { InterviewTokenGuard } from './app/core/guards/interview-token.guard';

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
    {
        path: 'prompts',
        component: LayoutComponent,
        loadChildren: () => import('./app/features/prompt/prompt.routes').then((m) => m.promptRoutes),
    },
    {
        path: 'interviews',
        component: LayoutComponent,
        loadChildren: () => import('./app/features/interviews/interviews.routes').then((m) => m.INTERVIEWS_ROUTES),
    },
    {
        path: 'interviews/:token',
        canActivate: [InterviewTokenGuard],
        loadComponent: () =>
            import('./app/features/interviews/components/interview-meeting/interview-meeting.component')
                .then(m => m.InterviewMeetingComponent)
    },
    {
        path: 'evaluation/:id',
        loadComponent: () =>
            import('./app/features/interviews/components/interview-evaluation/interview-evaluation.component').then(m => m.InterviewEvaluationComponent),
        title: 'Interview Evaluation'
    },
    {
        path: 'interview-cloture',
        loadComponent: () =>
            import('./app/features/interviews/components/interview-cloture/interview-cloture.component').then(m => m.InterviewClotureComponent),
        title: 'Interview Evaluation'
    },
    {
        path: 'token-error',
        loadComponent: () =>
            import('./app/features/interviews/token-error/token-error.component').then(m => m.TokenErrorComponent),
        title: 'Invalid Token'
    },
    {
        path: 'auth',
        loadChildren: () => import('./app/features/auth/auth.routes')
    },
    {
        path: '**',
        redirectTo: '/notfound'
    }
];
