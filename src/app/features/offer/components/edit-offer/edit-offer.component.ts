import { Component } from '@angular/core';
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
@Component({
  selector: 'app-edit-offer',
  standalone: true,
  imports: [
    CardModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    ConfirmDialogModule,                 // ← NEW
  ],
  providers: [MessageService], // ← NEW
  templateUrl: './edit-offer.component.html',
  styleUrls: ['./edit-offer.component.scss']
})
export class EditOfferComponent {
  offerForm: FormGroup;
  offer: Offer;

  constructor(
    private fb: FormBuilder,
    private offerService: OfferService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private confirmationModalService: ConfirmationModalService

  ) {
    this.offer = this.config.data.offer as Offer;

    this.offerForm = this.fb.group({
      title: [this.offer.title, [Validators.required, Validators.maxLength(200)]],
      description: [this.offer.description, [Validators.required]]
    });
  }
  ngOnInit() {}


  onSubmit() {

      this.confirmationModalService.confirmUpdate(() => {
        this.doSave();
      }, 'offer');
  }


  // NEW: actual save logic moved here (was inside onSubmit)
  private doSave() {
    const updatedOffer: Offer = {
      ...this.offer,
      ...this.offerForm.value
    };

    this.offerService.updateOffer(updatedOffer).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Offer has been updated successfully'
        });
        this.ref.close(true);
      },
      error: (err) => {
        console.error('Update failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Could not update the offer'
        });
        this.ref.close(false);
      }
    });
  }
}
