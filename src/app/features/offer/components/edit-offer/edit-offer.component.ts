import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OfferService } from '../../../../core/services/offer.service';
import { Offer } from '../../../../core/models/offer';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationModalService } from '../../../../core/services/utils/confirmation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-edit-offer',
    standalone: true,
    imports: [CardModule, ReactiveFormsModule, InputTextModule, TextareaModule, ButtonModule, ConfirmDialogModule, TranslateModule],
    providers: [MessageService],
    templateUrl: './edit-offer.component.html',
    styleUrls: ['./edit-offer.component.scss']
})
export class EditOfferComponent implements OnInit {
    offerForm: FormGroup;
    offer: Offer;

    constructor(
        private fb: FormBuilder,
        private offerService: OfferService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private confirmationModalService: ConfirmationModalService,
        private translate: TranslateService
    ) {
        this.offer = this.config.data.offer as Offer;

        this.offerForm = this.fb.group({
            title: [this.offer.title, [Validators.required, Validators.maxLength(200)]],
            description: [this.offer.description, [Validators.required]]
        });
    }

    ngOnInit() {}

    onSubmit() {
        this.confirmationModalService.confirmUpdate(
            () => {
                this.doSave();
            },
            'offer',
            {
                title: this.translate.instant('editOffer.confirmation.title'),
                message: this.translate.instant('editOffer.confirmation.message'),
                acceptLabel: this.translate.instant('editOffer.confirmation.accept'),
                rejectLabel: this.translate.instant('editOffer.confirmation.reject')
            }
        );
    }

    private doSave() {
        const updatedOffer: Offer = {
            ...this.offer,
            ...this.offerForm.value
        };

        this.offerService.updateOffer(updatedOffer).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('success.title'),
                    detail: this.translate.instant('editOffer.messages.success.updated')
                });
                this.ref.close(true);
            },
            error: (err) => {
                console.error('Update failed', err);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('error.title'),
                    detail: this.translate.instant('editOffer.messages.error.updateFailed')
                });
                this.ref.close(false);
            }
        });
    }
}
