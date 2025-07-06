import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { NgIf } from '@angular/common';
import { OfferService } from '../../../../core/services/offer.service';

@Component({
  selector: 'app-new-offer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    PanelModule ,
    NgIf

  ],
  templateUrl: './new-offer.component.html',
  styleUrls: ['./new-offer.component.scss']
})
export class NewOfferComponent {
  offerForm: FormGroup;
  types = ['Full-Time' , 'Part-Time' , 'Contract' , 'Internship']
  constructor(
    private formBuilder: FormBuilder, 
    private router: Router , 
    private offerService : OfferService)  {
    this.offerForm = formBuilder.group({
      titre: ['' , Validators.required],
      description: ['' ,Validators.required],
      salary: [null  , Validators.required , Validators.min(1000)],
      type: ['' ,Validators.required] ,
      department: ['' , Validators.required]
    });
  }

  onSubmit() {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }
  
    this.offerService.addOffer(this.offerForm.value);
    this.router.navigate(['/offers']);
  }
}
