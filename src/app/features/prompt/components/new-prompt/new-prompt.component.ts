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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-new-prompt',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule, RouterModule, CardModule, PanelModule, TranslateModule],
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
        private router: Router,
        private translate: TranslateService
    ) {}

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
                    summary: this.translate.instant('success.title'),
                    detail: this.translate.instant('newPrompt.messages.success.created')
                });
                this.promptForm.reset();
                setTimeout(() => {
                    this.router.navigate(['/prompts/prompt-list']);
                }, 1000);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('error.title'),
                    detail: error.message || this.translate.instant('newPrompt.messages.error.createFailed')
                });
            }
        });
    }
}
