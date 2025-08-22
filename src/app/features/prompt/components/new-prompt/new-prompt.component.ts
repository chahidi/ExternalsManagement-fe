import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PromptService } from '../../../../core/services/prompt.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-new-prompt',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    RouterModule,
    CardModule,
    PanelModule
  ],
  templateUrl: './new-prompt.component.html',
  styleUrls: ['./new-prompt.component.scss'],
  providers: [MessageService]
})
export class NewPromptComponent {
  promptForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private promptService: PromptService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.promptForm = this.formBuilder.group({
      promptCode: ['', [Validators.required]],
      promptDesc: ['', [Validators.required]],
      schema: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.promptForm.invalid) {
      this.promptForm.markAllAsTouched();
      return;
    }

    const payload = this.promptForm.value;

    this.promptService.createPrompt(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Prompt created successfully'
        });
        this.promptForm.reset();
        setTimeout(() => {
          this.router.navigate(['/prompts/prompt-list']);
        }, 1000);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message
        });
      },
    });
  }
}
