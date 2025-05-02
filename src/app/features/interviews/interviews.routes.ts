import { Routes } from '@angular/router';
import { InterviewListComponent } from './interview-list/interview-list.component';

export const INTERVIEWS_ROUTES: Routes = [
    {
        path: '',
        component: InterviewListComponent,
        children: [
            {
                path: 'interview-list',
                loadComponent: () => import('./interview-list/interview-list.component').then((m) => m.InterviewListComponent),
                title: 'List of Interviews'
            }
        ]
    },
    {
        path: 'interview-result',
        loadComponent: () => import('./interview-result/interview-result.component').then((m) => m.InterviewResultComponent),
        title: 'Interview Results'
    }
];
