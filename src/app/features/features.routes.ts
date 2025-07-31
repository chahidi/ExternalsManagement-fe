import { Routes } from '@angular/router';
import { NewPromptComponent } from './prompt/components/new-prompt/new-prompt.component';
import { PromptListComponent } from './prompt/components/prompt-list/prompt-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export default [
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
