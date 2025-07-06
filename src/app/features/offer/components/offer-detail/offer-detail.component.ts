import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OfferService } from '../../../../core/services/offer.service';
import { Offer } from '../../../../core/models/offer';
import { Interview } from '../../../../core/models/interview';
import { InterviewService } from '../../../../core/services/intereview.service';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [
    NgFor,
    NgIf ,
    NgClass,
    CardModule,
    ButtonModule,
    RouterModule
  ],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss']
})
export class OfferDetailComponent {
  offer : Offer | undefined 
  interviews : Interview[]= []

  constructor(private route: ActivatedRoute , 
    private offerService : OfferService ,
    private interviewService : InterviewService
  )
     {
   const id = this.route.snapshot.paramMap.get('id')
   if (id){
    this.offer =this.offerService.getOfferById(id)
    this.interviews = this.interviewService.getInterviewsByOfferId(id);
   }

  }
}
