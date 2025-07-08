import { Component, OnInit } from '@angular/core';
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
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { MessageService } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';


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
    DropdownModule,
    SliderModule,
    ToastModule,

  ],
  providers: [
    ConfirmationService, 
    DialogService , 
    MessageService],
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss']
})
export class OfferListComponent implements OnInit {
  offers: Offer[] = [];
  ref: DynamicDialogRef | undefined;
  searchQuery: string = '';

  filteredOffers: Offer[] = [];
  selectedDepartment : string = ""
  selectedType : string = ""
  selectedStatut : string = ""
  selectedSalaryRange: [number, number] = [3000, 6000];

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
  ]

  typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Internship', value: 'internship' }
  ]
  
  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' }
  ];

  constructor(
    private offerService: OfferService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private filterService : OfferFilterService,
    private messageService: MessageService
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
        this.messageService.add({
          severity : "success",
          summary : "Deleted" , 
          detail : "Offer has been deleted succesufully !"
        })
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
    this.messageService.add({
      severity : 'info' ,
      summary : "Clear" , 
      detail :  "The search is cleared !"
    })
  }

  applyAllFilters() {
    this.filteredOffers = this.offers.filter(offer => {
      return (
        (!this.selectedDepartment || offer.department === this.selectedDepartment) &&
        (!this.selectedType || offer.type === this.selectedType) &&
        (!this.selectedStatut || offer.status === this.selectedStatut)
      );
    });
  
    this.messageService.add({
      severity: 'info',
      summary: 'Filters Applied',
      detail: `${this.filteredOffers.length} offers matched your filters`
    });
  }
  
  resetFilters() {
    this.selectedDepartment = '';
    this.selectedType = '';
    this.selectedStatut = '';
    this.selectedSalaryRange = [3000, 6000];
    this.filteredOffers = this.offers;
    this.messageService.add({
      severity : "error" , 
      summary : "Reset" , 
      detail : "Reseting filters !"
    })
  }
}