import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../../../core/services/candidate.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { NotificationService } from '../../../../core/services/utils/notification.service';
import { TagModule } from 'primeng/tag';
import { PassedCandidate } from '../../../../core/models/passed-candidate';
import { InterviewInstance } from '../../../../core/models/interview-instance';
import { Router } from '@angular/router';

interface ProcessedCandidate extends PassedCandidate {
  location?: string;
  overallScore: number;
  evaluationScores: { [key: string]: number };
  evaluationTypes: string[];
}

@Component({
  selector: 'app-offer-candidates',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    LoaderComponent,
    TagModule
  ],
  templateUrl: './offer-candidates.component.html',
  styleUrls: ['./offer-candidates.component.scss']
})
export class OfferCandidatesComponent implements OnInit {
  @Input() offerId!: string;

  candidates: ProcessedCandidate[] = [];
  displayedColumns: string[] = [];
  isLoading$: any;
  loadingMessage$: any;

  // Track sort state for each column
  sortStates: { [key: string]: boolean } = {};

  constructor(
    private candidateService: CandidateService,
    private loader: LoaderService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading$ = this.loader.isLoading$;
    this.loadingMessage$ = this.loader.loadingMessage$;

    if (!this.offerId) {
      this.notify.showError('Error', 'Offer ID not found.');
      return;
    }

    this.loadPassedCandidates();
  }

  private loadPassedCandidates(): void {
    this.loader.show('Loading passed candidates...');
    
    this.candidateService.getPassedCandidatesForOffer(this.offerId).subscribe({
      next: (candidates) => {
        this.candidates = this.processCandidates(candidates);
        this.extractUniqueEvaluationTypes();
        this.sortByOverallScore(); // Initial sort by OverAll score descending
        this.loader.hide();
      },
      error: (err) => {
        console.error('Error loading passed candidates:', err);
        this.notify.showError('Error', 'Failed to load passed candidates');
        this.loader.hide();
      }
    });
  }

  private processCandidates(candidates: PassedCandidate[]): ProcessedCandidate[] {
    return candidates.map(candidate => {
      const evaluationScores: { [key: string]: number } = {};
      const evaluationTypes: string[] = [];
      let overallScore = 0;
      let overallFound = false;

      candidate.evaluations.forEach(evaluation => {
        let typeName = evaluation.evaluationType.description;

        // Standardize OverAll name
        if (typeName.toLowerCase().includes('overall') || typeName.toLowerCase().includes('général')) {
          typeName = 'OverAll';
          overallScore = evaluation.score;
          overallFound = true;
        }

        evaluationScores[typeName] = evaluation.score;

        if (!evaluationTypes.includes(typeName)) {
          evaluationTypes.push(typeName);
        }
      });

      // If no OverAll score found, calculate average
      if (!overallFound && candidate.evaluations.length > 0) {
        const sum = candidate.evaluations.reduce((acc, ev) => acc + ev.score, 0);
        overallScore = sum / candidate.evaluations.length;
        evaluationScores['OverAll'] = overallScore; // also add it to scores
        evaluationTypes.push('OverAll');
      }

      return {
        ...candidate,
        overallScore,
        evaluationScores,
        evaluationTypes
      };
    });
  }


  private extractUniqueEvaluationTypes(): void {
      const typesSet = new Set<string>();

      // Collect all evaluation types
      this.candidates.forEach(candidate => {
        candidate.evaluationTypes.forEach(type => typesSet.add(type));
      });

      const allTypes: string[] = [];

      // Add OverAll first if exists
      const overallType = Array.from(typesSet).find(t => t.toLowerCase().includes('overall') || t.toLowerCase().includes('général'));
      if (overallType) {
        allTypes.push('OverAll');  // standardize the name
      }

      // Add all other types in order of first appearance
      typesSet.forEach(type => {
        if (!type.toLowerCase().includes('overall')) {
          allTypes.push(type);
        }
      });

      this.displayedColumns = allTypes;

      // Initialize sort states
      this.sortStates['name'] = true;
      if (overallType) this.sortStates['OverAll'] = false; // descending by default
      this.displayedColumns.forEach(col => {
        if (!this.sortStates[col]) this.sortStates[col] = true;
      });
  }



  sortByOverallScore(): void {
    this.sortStates['OverAll'] = !this.sortStates['OverAll'];
    const ascending = this.sortStates['OverAll'];
    
    this.candidates = [...this.candidates].sort((a, b) => {
      return ascending 
        ? a.overallScore - b.overallScore
        : b.overallScore - a.overallScore;
    });
  }

  sortByName(): void {
    this.sortStates['name'] = !this.sortStates['name'];
    const ascending = this.sortStates['name'];
    
    this.candidates = [...this.candidates].sort((a, b) => {
      return ascending
        ? a.fullName.localeCompare(b.fullName)
        : b.fullName.localeCompare(a.fullName);
    });
  }

  sortByEvaluationType(evaluationType: string): void {
    this.sortStates[evaluationType] = !this.sortStates[evaluationType];
    const ascending = this.sortStates[evaluationType];
    
    this.candidates = [...this.candidates].sort((a, b) => {
      const scoreA = a.evaluationScores[evaluationType] || 0;
      const scoreB = b.evaluationScores[evaluationType] || 0;
      
      return ascending ? scoreA - scoreB : scoreB - scoreA;
    });
  }

 

  

  onGlobalFilter(event: Event, dt: any): void {
    const input = event.target as HTMLInputElement;
    dt.filterGlobal(input.value, 'contains');
  }

  openEvaluation(candidate: PassedCandidate): void {
    const interviewId = candidate.evaluations[0].interviewId; 
    const url = this.router.serializeUrl(this.router.createUrlTree(['/evaluation', interviewId]));
    window.open(url, '_blank');
}
    
}
