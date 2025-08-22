import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogModule, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { Chip } from 'primeng/chip';
import { Dialog } from 'primeng/dialog';
import { ConfirmationService, FilterService, MessageService } from 'primeng/api';

import { finalize } from 'rxjs/operators';

import { Offer } from '../../../../core/models/offer';
import { OfferService } from '../../../../core/services/offer.service';
import { OfferFilterService } from '../../../../core/services/offer-filter.service';
import { ConfirmationModalService } from '../../../../core/services/utils/confirmation.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { EditOfferComponent } from '../edit-offer/edit-offer.component';
import { FormsModule } from '@angular/forms';

// temporary local fallback until backend endpoint exists
import { SKILL_WORDS, KEYWORD_WORDS } from '../../../../core/constants/offer.const';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [
    LoaderComponent,
    CommonModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    DynamicDialogModule,
    FormsModule,
    SliderModule,
    ToastModule,
    MultiSelectModule,
    Chip,
    Dialog
  ],
  providers: [ConfirmationService, DialogService, MessageService],
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss']
})
export class OfferListComponent implements OnInit {
  @ViewChild('dt1') dt1!: Table;

  // loader streams (typed as any to match service shape)
  isLoading!: any;
  isLoading$!: any;
  loadingMessage$!: any;

  // data
  offers: any[] = [];
  filteredOffers: any[] = [];
  ref: DynamicDialogRef | undefined;

  // responsive
  screenWidth = window.innerWidth;

  // caption search
  searchQuery = '';

  // top filters
  interviewCountRange: [number, number] = [0, 10];
  maxInterviewCount = 10;

  selectedKeywordFilters: string[] = [];
  selectedSkillFilters: string[] = [];

  // options for both top filters and column filters
  keywordOptions: { label: string; value: string }[] = [];
  skillOptions: { label: string; value: string }[] = [];

  // numeric filter modes for column filter
  numericModes = [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'Greater Than', value: 'gt' },
    { label: 'Greater Or Equal', value: 'gte' },
    { label: 'Less Than', value: 'lt' },
    { label: 'Less Or Equal', value: 'lte' }
  ];

  // modal
  descDialogVisible = false;
  currentOffer: Offer | null = null;

  // caches
  private skillsCache = new Map<string, string[]>();
  private keywordsCache = new Map<string, string[]>();

  constructor(
    private cdr: ChangeDetectorRef,
    private offerService: OfferService,
    private loaderService: LoaderService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private confirmationModalService: ConfirmationModalService,
    private dialogService: DialogService,
    private filterService: OfferFilterService,
    private messageService: MessageService,
    private primeFilterService: FilterService
  ) {}

  ngOnInit(): void {
    try {
      // Register a custom match mode for arrays: "includesAny"
      this.primeFilterService.register('includesAny', (value: any, filter: any): boolean => {
        if (!filter || filter.length === 0) return true;
        const hay: string[] = Array.isArray(value) ? value.map(v => String(v).toLowerCase()) : [];
        const needles: string[] = Array.isArray(filter) ? filter.map((v: any) => String(v).toLowerCase()) : [];
        return needles.some(n => hay.includes(n));
      });


      // loader streams
      this.isLoading$ = this.loaderService.isLoading$;
      this.loadingMessage$ = this.loaderService.loadingMessage$;

      // initial fetch
      this.loadOffers();
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Initialization failed',
        detail: 'Could not configure filters/services. Some features may be limited.'
      });
    }
  }

  // Load rows and derive fields
  loadOffers() {
    this.loaderService.show('Loading Offers...');
    this.offerService.getOffers()
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (data) => {
          this.offers = (data as Offer[]).map((o) => {
            const interviewCount = (o as any)?.interviews?.length ?? 0;
            const keywords = this.keywordsFromDescription(o.description, o.id);
            const skills = this.skillsFromDescription(o.description, o.id);
            return { ...o, interviewCount, keywords, skills };
          });

          this.filteredOffers = this.offers;

          const counts = this.offers.map((o) => o.interviewCount);
          this.maxInterviewCount = counts.length ? Math.max(...counts) : 10;
          this.interviewCountRange = [0, this.maxInterviewCount];

          const keywordSet = new Set<string>();
          const skillSet = new Set<string>();
          for (const o of this.offers) {
            (o.keywords as string[])?.forEach((k) => keywordSet.add(k));
            (o.skills as string[])?.forEach((s) => skillSet.add(s));
          }
          this.keywordOptions = Array.from(keywordSet).sort().map((v) => ({ label: v, value: v }));
          this.skillOptions = Array.from(skillSet).sort().map((v) => ({ label: v, value: v }));
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load offers from server' });
        }
      });
  }

  // Modal
  openDescModal(offer: Offer) {
    this.currentOffer = offer;
    this.descDialogVisible = true;
  }

  // Actions
  deleteOffer(offerId: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this offer?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.offerService.deleteOffer(offerId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Offer has been deleted successfully!' });
            this.loadOffers();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete offer.' });
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
    this.ref.onClose.subscribe((updated) => {
      if (updated) this.loadOffers();
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth;
    // if you use OnPush or things still don’t update:
    this.cdr.markForCheck();
  }

  // Helpers
  teaser(desc: string | null | undefined): string {
    if (!desc) return '';
    const compact = desc.trim().replace(/\s+/g, ' ');

    let len = 180;                     // desktop
    if (this.screenWidth < 640)  len = 60;        // mobile
    else if (this.screenWidth < 1024) len = 100;  // tablet

    return compact.length > len ? compact.slice(0, len) + '…' : compact;
  }

  keywordsFromDescription(desc?: string, id?: string): string[] {
    if (!desc) return [];
    if (id && this.keywordsCache.has(id)) return this.keywordsCache.get(id)!;
    const lower = desc.toLowerCase();
    const hits = KEYWORD_WORDS
      .filter((k) => lower.includes(k.toLowerCase()))
      .sort((a, b) => lower.indexOf(a.toLowerCase()) - lower.indexOf(b.toLowerCase()));
    if (id) this.keywordsCache.set(id, hits);
    return hits;
  }

  skillsFromDescription(desc?: string, id?: string): string[] {
    if (!desc) return [];
    if (id && this.skillsCache.has(id)) return this.skillsCache.get(id)!;
    const lower = desc.toLowerCase();
    const hits = SKILL_WORDS
      .filter((s) => lower.includes(s.toLowerCase()))
      .sort((a, b) => lower.indexOf(a.toLowerCase()) - lower.indexOf(b.toLowerCase()));
    if (id) this.skillsCache.set(id, hits);
    return hits;
  }

  // Top search + top filters
  onSearch() {
    this.filteredOffers = this.filterService.searchOffers(this.offers, this.searchQuery);
  }

  clear(dt: Table) {
    this.searchQuery = '';
    this.selectedKeywordFilters = [];
    this.selectedSkillFilters = [];
    this.interviewCountRange = [0, this.maxInterviewCount];
    this.filteredOffers = this.offers;

    // clear table filters/sort
    if (dt && (dt as any).clear) {
      (dt as any).clear();
    }

    this.messageService.add({ severity: 'info', summary: 'Clear', detail: 'The search is cleared!' });
  }

  applyAllFilters() {
    const [minC, maxC] = this.interviewCountRange;
    const selectedKeywords = new Set(this.selectedKeywordFilters.map((v) => v.toLowerCase()));
    const selectedSkills = new Set(this.selectedSkillFilters.map((v) => v.toLowerCase()));

    this.filteredOffers = this.offers.filter((o) => {
      const countOk = o.interviewCount >= minC && o.interviewCount <= maxC;

      const offerKeywords = (o.keywords as string[])?.map((v) => v.toLowerCase()) ?? [];
      const offerSkills = (o.skills as string[])?.map((v) => v.toLowerCase()) ?? [];

      const kwOk = selectedKeywords.size === 0 || offerKeywords.some((k) => selectedKeywords.has(k));
      const skOk = selectedSkills.size === 0 || offerSkills.some((s) => selectedSkills.has(s));

      return countOk && kwOk && skOk;
    });

    this.messageService.add({ severity: 'info', summary: 'Filters Applied', detail: `${this.filteredOffers.length} offers matched` });
  }

  resetFilters() {
    this.selectedKeywordFilters = [];
    this.selectedSkillFilters = [];
    this.searchQuery = '';
    this.interviewCountRange = [0, this.maxInterviewCount];
    this.filteredOffers = this.offers;

    // clear column filters in the table as well
    if (this.dt1 && (this.dt1 as any).clear) {
      (this.dt1 as any).clear();
    }

    this.messageService.add({ severity: 'info', summary: 'Reset', detail: 'Filters reset.' });
  }

  goToDetails(offer: Offer): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/offer', offer.id]));
    window.open(url, '_blank');
  }

  get offerDescription(): string {
    return this.currentOffer?.description || 'No description';
  }

  confirmDelete(id: string) {
    this.confirmationModalService.confirmDelete(() => {
      this.deleteOffer(id);
    }, 'offer');
  }
}
