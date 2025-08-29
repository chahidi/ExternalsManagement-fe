import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../../../core/services/candidate.service';
import { CandidateOffer } from '../../../../core/models/candidate-offer';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { NotificationService } from '../../../../core/services/utils/notification.service';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import {EvaluationTypeService } from '../../../../core/services/evaluation-type.service';
import { EvaluationType } from '../../../../core/models/evaluation-type';
import { InterviewService } from '../../../../core/services/interview.service';
import { CreateInterview } from '../../../../core/models/create-interview';
import { switchMap, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-recommended-candidates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    DatePickerModule,
    MultiSelectModule,
    InputNumberModule,
    InputTextModule,
    LoaderComponent
  ],
  templateUrl: './recommended-candidates.component.html',
  styleUrls: ['./recommended-candidates.component.scss']
})
export class RecommendedCandidatesComponent implements OnInit {
  @Input() offerId!: string;

  candidates: CandidateOffer[] = [];
  isLoading$!: any;
  loadingMessage$!: any;

  // sorting flags
  nameSortAsc = true;
  techSortAsc = true;

  displayDetailsDialog = false;
  showConvocateDialog = false;
  showNewEvalDialog = false;

  selectedCandidate!: CandidateOffer;

  evaluationTypes: EvaluationType[] = [];
  newEvaluationType: EvaluationType = { id: '', description: '', coefficient: 1 };

  interviewConfig = {
    description: '',
    schedule: null as Date | null,
    criteria: [] as EvaluationType[],
    totalQuestions: 10,
    duration: 30
  };

  constructor(
    private candidateService: CandidateService,
    private loader: LoaderService,
    private notify: NotificationService,
    private evaluationTypeService: EvaluationTypeService,
    private interviewService: InterviewService
  ) {}

  ngOnInit(): void {
    this.isLoading$ = this.loader.isLoading$;
    this.loadingMessage$ = this.loader.loadingMessage$;

    if (!this.offerId) {
      this.notify.showError('Error', 'Did not find the id of the offer.');
      return;
    }

    this.loadRecommendedCandidatesForOffer(this.offerId);
    this.loadEvaluationTypes();
  }

  private loadEvaluationTypes(): void {
    this.evaluationTypeService.getAllEvaluationTypes().subscribe({
      next: (types) => (this.evaluationTypes = types),
      error: () => this.notify.showError('Error', 'Failed to load evaluation types')
    });
  }

  createEvaluationType(): void {
    if (!this.newEvaluationType.description) {
      this.notify.showError('Validation Error', 'Description is required.');
      return;
    }

    this.evaluationTypeService.createEvaluationType(this.newEvaluationType).subscribe({
      next: (created) => {
        this.evaluationTypes.push(created);
        this.notify.showSuccess('Success', 'Evaluation type created.');
        this.showNewEvalDialog = false;
        this.newEvaluationType = { id: '', description: '', coefficient: 1 };
      },
      error: () => this.notify.showError('Error', 'Failed to create evaluation type')
    });
  }

  onGlobalFilter(event: Event, dt: any) {
    const input = event.target as HTMLInputElement;
    dt.filterGlobal(input.value, 'contains');
  }

  private loadRecommendedCandidatesForOffer(offerId: string): void {
    this.loader.show('Loading recommended candidates...');
    this.candidateService.getRecommendedCandidates(offerId).subscribe({
      next: (res) => {
        this.candidates = res;
        this.loader.hide();
      },
      error: () => {
        this.notify.showError('Error', 'Failed to load candidates');
        this.loader.hide();
      }
    });
  }

  sortByName() {
    this.nameSortAsc = !this.nameSortAsc;
    this.candidates = [...this.candidates].sort((a, b) =>
      this.nameSortAsc ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName)
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

  viewCandidateDetails(candidate: CandidateOffer) {
    this.selectedCandidate = candidate;
    this.displayDetailsDialog = true;
  }

  convocateForInterview(candidate: CandidateOffer) {
    this.selectedCandidate = candidate;
    this.resetInterviewConfig();
    this.showConvocateDialog = true;
  }

  private resetInterviewConfig() {
    this.interviewConfig = {
      description: '',
      schedule: null,
      criteria: [],
      totalQuestions: 10,
      duration: 30
    };
  }

  confirmConvocation() {
  if (!this.selectedCandidate) return;

  if (!this.interviewConfig.description || !this.interviewConfig.schedule) {
    this.notify.showError('Validation Error', 'Please provide description and schedule.');
    return;
  }

  const payload = {
    scheduledAt: this.interviewConfig.schedule,
    description: this.interviewConfig.description,
    feedbackGeneral: '',
    comment: '',
    estimatedDuration: this.interviewConfig.duration,
    candidateId: this.selectedCandidate.id,
    offerId: this.offerId,
    numberOfQuestions: this.interviewConfig.totalQuestions
  };

  this.loader.show('Creating interview...');

  this.interviewService.createInterview(payload).pipe(
    switchMap(createdInterview =>
      this.interviewService.generateAndSaveInterviewLink(createdInterview).pipe(
        switchMap(() => this.interviewService.sendEmail(createdInterview)),
        tap(() => {
          this.notify.showSuccess('Success', 'Interview created, link generated, and email sent.');
          this.showConvocateDialog = false;
        })
      )
    ),
    finalize(() => this.loader.hide())
  ).subscribe({
    error: () => this.notify.showError('Error', 'Something went wrong during interview convocation')
  });
}



}
