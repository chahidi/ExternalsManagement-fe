import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../../../core/services/candidate.service';
import { CandidateOffer } from '../../../../core/models/candidate-offer';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { NotificationService } from '../../../../core/services/utils/notification.service';

@Component({
  selector: 'app-recommended-candidates',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    LoaderComponent
  ],
  templateUrl: './recommended-candidates.component.html',
  styleUrls: ['./recommended-candidates.component.scss']
})
export class RecommendedCandidatesComponent implements OnInit {
  @Input() offerId!: string;

  candidates: CandidateOffer[] = [];
  isLoading$! : any;
    loadingMessage$! : any;

  nameSortAsc = true;
  techSortAsc = true;

  constructor(
    private candidateService: CandidateService,
    private loader: LoaderService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.isLoading$ = this.loader.isLoading$;
  this.loadingMessage$ = this.loader.loadingMessage$;
    if (!this.offerId) {
      this.notify.showError('Error', 'Did not find the id of the offer, please return to the previous page');
      return;
    }
    this.loadRecommendedCandidatesForOffer(this.offerId);
  }

  private loadRecommendedCandidatesForOffer(offerId: string): void {
    this.loader.show('Loading recommended candidates...');
    this.candidateService.getRecommendedCandidates(offerId).subscribe({
      next: (res) => {
        this.candidates = res;
        this.loader.hide();
      },
      error: () => {
        this.notify.showError('Error', 'Failed to load recommended candidates');
        this.loader.hide();
      }
    });
  }

  sortByName() {
    this.nameSortAsc = !this.nameSortAsc;
    this.candidates = [...this.candidates].sort((a, b) =>
      this.nameSortAsc
        ? a.fullName.localeCompare(b.fullName)
        : b.fullName.localeCompare(a.fullName)
    );
  }

  sortByTech() {
    this.techSortAsc = !this.techSortAsc;
    this.candidates = [...this.candidates].sort((a, b) =>
      this.techSortAsc
        ? (a.mainTech || '').localeCompare(b.mainTech || '')
        : (b.mainTech || '').localeCompare(a.mainTech || '')
    );
  }
  onGlobalFilter(event: Event, dt: any) {
  const input = event.target as HTMLInputElement;
  dt.filterGlobal(input.value, 'contains');
}
}
