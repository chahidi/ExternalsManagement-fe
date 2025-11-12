import { Routes } from '@angular/router';
import { LayoutComponent } from './app/shared/layout/layout.component';
import { InterviewTokenGuard } from './app/core/guards/interview-token.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./app/features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
            },
            {
                path: 'candidates',
                loadChildren: () => import('./app/features/candidate/candidate-routes').then((m) => m.CANDIDATE_FORMS_ROUTES),
            },
            {
                path: 'offers',
                loadChildren: () => import('./app/features/offer/offer-routes').then((m) => m.OFFER_ROUTES),
            },
            {
                path: 'prompts',
                loadChildren: () => import('./app/features/prompt/prompt.routes').then((m) => m.promptRoutes),
            },
            {
                path: 'interviews',
                loadChildren: () => import('./app/features/interviews/interviews.routes').then((m) => m.INTERVIEWS_ROUTES),
            }
        ]
    },

    {
        path: 'offer/:id',
        loadComponent: () =>
            import('./app/features/offer/components/offer-details/offer-details.component').then(m => m.OfferDetailsComponent),
        title: 'Offer details'
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
        redirectTo: '/dashboard'
    }
];
