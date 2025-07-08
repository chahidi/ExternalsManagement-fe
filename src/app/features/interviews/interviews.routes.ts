import { Routes } from '@angular/router';

export const INTERVIEWS_ROUTES: Routes = [
  {
    path: 'interview-list',
    loadComponent: () =>
      import('./components/interview-list/interview-list.component').then(m => m.InterviewListComponent),
    title: 'List of Interviews'
  },
  {
    path: 'evaluation/:id',
    loadComponent: () =>
      import('./components/interview-evaluation/interview-evaluation.component').then(m => m.InterviewEvaluationComponent),
    title: 'Interview Evaluation'
  }
];
