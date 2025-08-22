import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { OfferService } from '../../../../core/services/offer.service';

@Component({
  selector: 'app-new-offer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PanelModule,
    InputTextModule,
    TextareaModule,
    ButtonModule
  ],
  templateUrl: './new-offer.component.html',
  styleUrls: ['./new-offer.component.scss']
})
export class NewOfferComponent {
  offerForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private offerService: OfferService
  ) { }

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

    const payload = this.offerForm.value; // { title, description }

    this.offerService.addOffer(payload).subscribe({
      next: () => {
        this.router.navigate(['/offers']);
      },
      error: (err) => {
        console.error('Error creating offer', err);
      }
    });
  }
}
