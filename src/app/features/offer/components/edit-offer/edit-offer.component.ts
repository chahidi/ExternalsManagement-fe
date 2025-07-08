import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OfferService } from '../../../../core/services/offer.service';
import { Offer } from '../../../../core/models/offer';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {  CardModule } from 'primeng/card';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-edit-offer',
  standalone: true,
  imports: [
    NgIf, 
    CardModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    ToastModule
  ], 
  providers  : [MessageService], 
  templateUrl: './edit-offer.component.html',
  styleUrls: ['./edit-offer.component.scss']
})
export class EditOfferComponent {
  offerForm: FormGroup;
  offer: Offer;

  typeOptions = [
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Internship', value: 'internship' }
  ];
  departmentOptions = [
    { label: 'Data Analyst', value: 'Data Analyst' },
    { label: 'Front End', value: 'Front End' },
    { label: 'Back End', value: 'Back End' },
    { label: 'Full-stuck ', value: 'Full-Stuck' },
    { label: 'Tester', value: 'Tester' },
    { label: 'Java developer', value: 'Java developer' },
    { label: 'Angular Developer', value: 'Angular developer' },
    { label: 'Devops', value: 'Devops' },
    { label: 'networking systhem', value: 'networking systhem' },
    { label: 'database administrator', value: 'database Adminstrator' }
  ];

  constructor(
    private fb: FormBuilder,
    private offerService: OfferService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig , 
    private messageService : MessageService 
  ) {
    this.offer = this.config.data.offer;

    this.offerForm = this.fb.group({
      titre: [this.offer.titre, Validators.required],
      description: [this.offer.description, Validators.required],
      type: [this.offer.type, Validators.required],
      department: [this.offer.department, Validators.required]
    });
  }

  onSubmit() {
    if (this.offerForm.valid) {
      const updatedOffer: Offer = {
        ...this.offer,
        ...this.offerForm.value
      };
      const result = this.offerService.updateOffer(updatedOffer);
      this.messageService.add({
        severity : "success" ,
        summary : "Update", 
        detail  : "Offer has been updated succesfully"
      })
      
      if (result) {
        this.ref.close(true);
      } else {
        this.ref.close(false);
      }
    }
  }
}