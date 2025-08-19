import { Component, OnInit } from '@angular/core';
import { OfferService } from '../../../../core/services/offer.service';

@Component({
  selector: 'app-offer-details',
  imports: [],
  templateUrl: './offer-details.component.html',
  styleUrl: './offer-details.component.scss'
})
export class OfferDetailsComponent implements OnInit{

  isLoading : boolean = false;

  constructor (
    private offerServ : OfferService
  ){
  }

  ngOnInit(): void {
      
  }

}
