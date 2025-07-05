import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PromptService } from '../../../../core/services/prompt.service';
import { Prompt } from '../../../../core/models/prompt';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-new-prompt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    RouterModule
],
  templateUrl: './new-prompt.component.html',
  styleUrl: './new-prompt.component.scss',
  providers: [MessageService]
})
export class NewPromptComponent {
  prompt: Prompt = {
    id: '',
    promptCode: '',
    promptDesc: '',
    schema: '',
  };

  constructor(private promptService: PromptService, private messageService: MessageService, private router: Router) {}

  onSubmit() {
    this.promptService.createPrompt(this.prompt).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Prompt created successfully' });
        this.prompt = {
            id: '',
            promptCode: '',
            promptDesc: '',
            schema: '',
        };
        this.router.navigate(['/features/prompts/prompt-list']);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      },
    });
  }
}
