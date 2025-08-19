import { Component, OnInit } from '@angular/core';
import { OfferService } from '../../../../core/services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../../../core/services/utils/notification.service';
import { Offer } from '../../../../core/models/offer';
import { OfferFormattedDescription } from '../../../../core/models/offerFormattedDescription';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [],
  providers: [MessageService,NotificationService],
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent implements OnInit{

  isLoading : boolean = false;
  skillsList: string[] = [];
  mainResponsibilitiesList: string[] = [];
  educationList: string[] = [];
  keywordsList: string[] = [];
  offerTitle: string = '';


  constructor (
    private offerServ : OfferService,
    private router: Router,
    private route: ActivatedRoute,
    private notify: NotificationService
  ){
  }

  ngOnInit(): void {
      this.isLoading = true; 
      const id = this.route.snapshot.paramMap.get('id');
      if(!id){
        this.notify.showError('Error', 'Did not find the id of the offer could you please return to the previous page');
        return;
      }
      this.loadOfferFormattedDescriptionAndOfferTitle(id);
  }

  loadOfferFormattedDescriptionAndOfferTitle (offerId: string): void{
    this.offerServ.getOfferById(offerId).subscribe({
      next: (offer: Offer) => {
        this.offerTitle = offer.title;
      },
      error: (err) => {
        this.notify.showError('Error', 'Failed to load offer data')
      }
    });

    this.offerServ.getOfferFormattedDescription(offerId).subscribe({
      next: (offerFormattedDescription: OfferFormattedDescription) => {
        this.skillsList = offerFormattedDescription.skills.split('-');
        this.mainResponsibilitiesList = offerFormattedDescription.mainResponsibilities.split('-');
        this.educationList = offerFormattedDescription.education.split('-');
        this.keywordsList = offerFormattedDescription.keywords.split('-');
      },
      error: (err) => {
        this.notify.showError('Error', 'Failed to load offer formatted Description');
      }
    })

  }

}
