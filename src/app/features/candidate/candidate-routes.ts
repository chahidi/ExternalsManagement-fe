import { Routes } from '@angular/router';
import { CandidateFormComponent } from './components/candidate-form/candidate-form.component';

export const CANDIDATE_FORMS_ROUTES: Routes = [
  {
    path: '',
    component: CandidateFormComponent,
    children: [
      {
        path: 'new-candidate', loadComponent: () => import('./components/candidate-form/candidate-form.component')
          .then(m => m.CandidateFormComponent),
        title: ''
      }

    ],
  }]
