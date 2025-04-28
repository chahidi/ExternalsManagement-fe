import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/layout/layout.component'; // Keep LayoutComponent

export const INTERVIEWS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./interview-list/interview-list.component').then(m => m.InterviewListComponent),
        title: 'List of Interviews'
      },
      {
        path: 'result',
        loadComponent: () =>
          import('./interviews-result/interviews-result.component').then(m => m.InterviewsResultComponent),
        title: 'Interview Results'
      }
    ]
  }
];
