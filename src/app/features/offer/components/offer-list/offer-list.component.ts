import { Component, NgModule, OnInit } from '@angular/core';
import { Offer } from '../../../../core/models/offer';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Router, RouterOutlet } from '@angular/router';
import { OfferService } from '../../../../core/services/offer.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService} from 'primeng/api';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditOfferComponent } from '../edit-offer/edit-offer.component';
import { NgClass } from '@angular/common';
import { OfferFilterService } from '../../../../core/services/offer-filter.service';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [
    NgClass,
    RouterOutlet,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    DynamicDialogModule,
    FormsModule,
  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss']
})
export class OfferListComponent implements OnInit {
  offers: Offer[] = [];
  ref: DynamicDialogRef | undefined;
  searchQuery: string = '';
  filteredOffers: Offer[] = [];


  constructor(
    private offerService: OfferService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private filterService : OfferFilterService
  ) {}

  ngOnInit(): void {
    this.offers = this.offerService.getOffers();

    // initilal
    this.filteredOffers = this.offers; 
  }

  goToDetails(offerId: string): void {
    this.router.navigate(['/offers', offerId]);
  }

  deleteOffer(offerId: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this offer?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.offerService.deleteOffer(offerId);
        this.offers = this.offerService.getOffers();
      }
    });
  }

  openEditOffer(offer: Offer) {
    this.ref = this.dialogService.open(EditOfferComponent, {
      header: 'Edit Offer',
      width: '70%',
      height: '65%',
      data: { offer }
    });

    this.ref.onClose.subscribe(updated => {
      if (updated) {
        this.offers = this.offerService.getOffers();
      }
    });
  }

  // filter & search 
  onSearch() {
    this.filteredOffers = this.filterService.searchOffers(this.offers, this.searchQuery);
  }
  clear(dt: any) {
    this.searchQuery = '';
    this.filteredOffers = this.offers;
    dt.reset(); 
  }
}