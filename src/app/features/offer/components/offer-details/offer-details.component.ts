import { Component, OnInit } from '@angular/core';
import { OfferService } from '../../../../core/services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../../../core/services/utils/notification.service';
import { Offer } from '../../../../core/models/offer';
import { OfferFormattedDescription } from '../../../../core/models/offerFormattedDescription';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { OfferFormattedDescriptionLanguage } from '../../../../core/models/offerFormattedDescriptionLanguage';
import { LoaderService } from '../../../../core/services/loader.service';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { ListboxModule } from 'primeng/listbox';



@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [LoaderComponent,CommonModule, TagModule, CardModule, ChipModule,ListboxModule],
  providers: [MessageService, NotificationService],
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent implements OnInit {

  isLoading$!: any;
  loadingMessage$!: any;
  skillsList: string[] = [];
  mainResponsibilitiesList: string[] = [];
  educationList: string[] = [];
  keywordsList: string[] = [];
  offerTitle: string = '';
  languages: OfferFormattedDescriptionLanguage[] = [];
  description: string = '';
  mainTech: string = '';
  yearsOfExperience: number = 0;


  constructor(
    private offerServ: OfferService,
    private router: Router,
    private route: ActivatedRoute,
    private notify: NotificationService,
    private loader: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.loader.isLoading$;
    this.loadingMessage$ = this.loader.loadingMessage$;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notify.showError('Error', 'Did not find the id of the offer, please return to the previous page');
      return;
    }

    this.loader.show('Loading offer details...');
    this.loadOfferFormattedDescriptionAndOfferTitle(id);
  }

  loadOfferFormattedDescriptionAndOfferTitle(offerId: string): void {
    this.offerServ.getOfferById(offerId).subscribe({
      next: (offer: Offer) => {
        this.offerTitle = offer.title;
      },
      error: () => {
        this.notify.showError('Error', 'Failed to load offer data');
        this.loader.hide();
      }
    });

    this.offerServ.getOfferFormattedDescription(offerId).subscribe({
      next: (offerFormattedDescription: OfferFormattedDescription) => {
        this.skillsList = offerFormattedDescription.skills.split('-');
        this.mainResponsibilitiesList = offerFormattedDescription.mainResponsibilities.split('-');
        this.educationList = offerFormattedDescription.education.split('-');
        this.keywordsList = offerFormattedDescription.keywords.split('-');
        this.languages = offerFormattedDescription.languages;
        this.description = offerFormattedDescription.description;
        this.mainTech = offerFormattedDescription.mainTech;
        this.yearsOfExperience = offerFormattedDescription.yearsOfExperience;

        this.loader.hide();
      },
      error: () => {
        this.notify.showError('Error', 'Failed to load offer formatted description');
        this.loader.hide();
      }
    });
  }
}