// prompt.routes.ts
import { Routes } from '@angular/router';
import { NewPromptComponent } from './components/new-prompt/new-prompt.component';
import { PromptListComponent } from './components/prompt-list/prompt-list.component';

export const promptRoutes: Routes = [
  { path: 'new-prompt', component: NewPromptComponent },
  { path: 'prompt-list', component: PromptListComponent },
];