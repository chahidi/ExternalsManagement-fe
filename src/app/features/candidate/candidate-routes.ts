import { Routes } from '@angular/router';
import { CandidateListComponent } from './components/candidate-list/candidate-list.component';

export const CANDIDATE_FORMS_ROUTES: Routes = [
  {
    path: '',
    component: CandidateListComponent,
    children: [
      {
        path: 'candidate-list', loadComponent: () => import('./components/candidate-list/candidate-list.component')
          .then(m => m.CandidateListComponent),
        title: ''
      }
    ],
  },
  {
    path: 'new-cv',
    loadComponent: () => import('./components/new-cv/new-cv.component')
      .then(m => m.NewCvComponent),
    title: 'New CV'
  }
];
