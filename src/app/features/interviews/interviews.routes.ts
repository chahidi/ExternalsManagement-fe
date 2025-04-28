import { Routes } from '@angular/router';
import { InterviewListComponent } from './interview-list/interview-list.component';
import { InterviewsResultComponent } from './interviews-result/interviews-result.component';

export const INTERVIEWS_ROUTES: Routes = [
  { path: 'list', component: InterviewListComponent },
  { path: 'result', component: InterviewsResultComponent }
];
