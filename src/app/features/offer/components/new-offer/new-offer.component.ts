import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { OfferService } from '../../../../core/services/offer.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-new-offer',
    standalone: true,
    imports: [ReactiveFormsModule, PanelModule, InputTextModule, TextareaModule, ButtonModule, TranslateModule, ToastModule],
    providers: [MessageService],
    templateUrl: './new-offer.component.html',
    styleUrls: ['./new-offer.component.scss']
})
export class NewOfferComponent {
    offerForm!: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private offerService: OfferService,
        private translate: TranslateService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.offerForm = this.formBuilder.group({
            title: ['', [Validators.required, Validators.maxLength(200)]],
            description: ['', [Validators.required]]
        });
    }

    onSubmit() {
        if (this.offerForm.invalid) {
            this.offerForm.markAllAsTouched();
            return;
        }

        const payload = this.offerForm.value;

        this.offerService.addOffer(payload).subscribe({
            next: (createdOffer) => {
                this.offerService.prepareOfferFormattedDescription(createdOffer.id).subscribe({
                    next: (formatted) => {
                        console.log('Formatted description:', formatted);
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('newOffer.messages.success'),
                            life: 3000
                        });
                        this.router.navigate(['/offers']);
                    },
                    error: (err) => {
                        console.error('Error preparing formatted description', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('newOffer.messages.formattingError'),
                            detail: err.message || '',
                            life: 5000
                        });
                    }
                });
            },
            error: (err) => {
                console.error('Error creating offer', err);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('newOffer.messages.error'),
                    detail: err.message || '',
                    life: 5000
                });
            }
        });
    }
}
