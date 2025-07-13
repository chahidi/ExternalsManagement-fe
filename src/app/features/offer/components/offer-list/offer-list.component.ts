import { Component, OnInit } from '@angular/core';
import { Offer } from '../../../../core/models/offer';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Router, RouterOutlet } from '@angular/router';
import { OfferService } from '../../../../core/services/offer.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService ,MessageService } from 'primeng/api';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditOfferComponent } from '../edit-offer/edit-offer.component';
import { NgClass ,CommonModule } from '@angular/common';
import { OfferFilterService } from '../../../../core/services/offer-filter.service';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';


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
    MultiSelectModule,
    CommonModule,
    RouterOutlet
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ],
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss']
})
export class OfferListComponent implements OnInit {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  ref: DynamicDialogRef | undefined;
  searchQuery: string = '';

  selectedDepartments: string[] = [];
  selectedTypes: string[] = [];
  selectedStatut: string = '';
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
  ];

  typeOptions = [
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Internship', value: 'internship' }
  ];

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
    private filterService: OfferFilterService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers() {
    this.offerService.getOffers().subscribe({
      next: (data) => {
        this.offers = data;
        this.filteredOffers = this.offers;
      },
      error: (err) => {
        console.error('Failed to load offers', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load offers from server'
        });
      }
    });
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
        this.offerService.deleteOffer(offerId).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Deleted",
              detail: "Offer has been deleted successfully!"
            });
            this.loadOffers();
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete offer."
            });
          }
        });
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
        this.loadOffers();
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
      severity: 'info',
      summary: "Clear",
      detail: "The search is cleared!"
    });
  }

  applyAllFilters() {
  
    this.filteredOffers = this.offers.filter(offer => {
      const offerDept = offer.department?.toLowerCase().trim() || '';
      const offerType = offer.type?.toLowerCase().trim() || '';
      const offerStatus = offer.status?.toLowerCase().trim() || '';
  
      return (
        (this.selectedDepartments.length === 0 || 
         this.selectedDepartments.some(d => {
           console.log('Checking department:', d, 'against', offerDept);
           return d.toLowerCase().trim() === offerDept;
         })) &&
  
        (this.selectedTypes.length === 0 || 
         this.selectedTypes.some(t => {
           console.log('Checking type:', t, 'against', offerType);
           return t.toLowerCase().trim() === offerType;
         })) &&
  
        (!this.selectedStatut || 
         this.selectedStatut.toLowerCase().trim() === offerStatus)
      );
    });
  
    this.messageService.add({
      severity: 'info',
      summary: 'Filters Applied',
      detail: `${this.filteredOffers.length} offers matched your filters`
    });
  }
  
  
  

  resetFilters() {
    this.selectedDepartments = [];
    this.selectedTypes = [];
    this.selectedStatut = '';
    this.filteredOffers = this.offers;
    this.messageService.add({
      severity: "error",
      summary: "Reset",
      detail: "Reseting filters!"
    });
  }
}
