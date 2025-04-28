import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/layout/layout.component'; // important!
import { InterviewListComponent } from './interview-list/interview-list.component';
import { InterviewsResultComponent } from './interviews-result/interviews-result.component';

export const INTERVIEWS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,     
    children: [
      { path: 'list', component: InterviewListComponent },
      { path: 'result', component: InterviewsResultComponent }
    ]
  }
];
