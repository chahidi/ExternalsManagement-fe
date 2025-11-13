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
import { EmailValidator, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EvaluationTypeService } from '../../../../core/services/evaluation-type.service';
import { EvaluationType } from '../../../../core/models/evaluation-type';
import { InterviewService } from '../../../../core/services/interview.service';
import { CreateInterview } from '../../../../core/models/create-interview';
import { switchMap, finalize, tap, catchError, map } from 'rxjs/operators';
import { GenerateInterviewQuestionsRequest } from '../../../../core/models/generate-interview-questions-request';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ERROR_MESSAGES } from '../../../../core/constants/error-messages.const';
import { Observable, EMPTY } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-recommended-candidates',
    standalone: true,
    imports: [CommonModule, TooltipModule, CardModule, TableModule, ButtonModule, DialogModule, DatePickerModule, MultiSelectModule, InputNumberModule, InputTextModule, LoaderComponent, ReactiveFormsModule, FormsModule, ToastModule, TranslateModule],
    templateUrl: './recommended-candidates.component.html',
    styleUrls: ['./recommended-candidates.component.scss'],
    providers: [MessageService, NotificationService]
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

    interviewForm!: FormGroup;
    isCreating = false;

    constructor(
        private candidateService: CandidateService,
        private loader: LoaderService,
        private notify: NotificationService,
        private evaluationTypeService: EvaluationTypeService,
        private interviewService: InterviewService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.isLoading$ = this.loader.isLoading$;
        this.loadingMessage$ = this.loader.loadingMessage$;

        if (!this.offerId) {
            this.notify.showError(this.translate.instant('error.title'), this.translate.instant('recommendedCandidates.messages.error.offerIdNotFound'));
            return;
        }

        this.loadRecommendedCandidatesForOffer(this.offerId);
        this.loadEvaluationTypes();
        this.interviewForm = this.fb.group({
            description: ['', Validators.required],
            schedule: [null, Validators.required],
            criteria: [[], [Validators.required, Validators.minLength(1)]],
            totalQuestions: [10, [Validators.required, Validators.min(5)]],
            duration: [30, [Validators.required, Validators.min(10)]]
        });
    }

    private loadEvaluationTypes(): void {
        this.evaluationTypeService.getAllEvaluationTypes().subscribe({
            next: (types) => (this.evaluationTypes = types),
            error: () => this.notify.showError(this.translate.instant('error.title'), this.translate.instant('recommendedCandidates.messages.error.loadEvaluationTypesFailed'))
        });
    }

    createEvaluationType(): void {
        if (!this.newEvaluationType.description) {
            this.notify.showError(this.translate.instant('error.title'), this.translate.instant('recommendedCandidates.messages.error.validation.descriptionRequired'));
            return;
        }

        this.evaluationTypeService.createEvaluationType(this.newEvaluationType).subscribe({
            next: (created) => {
                this.evaluationTypes.push(created);
                this.notify.showSuccess(this.translate.instant('success.title'), this.translate.instant('recommendedCandidates.messages.success.evaluationTypeCreated'));
                this.showNewEvalDialog = false;
                this.newEvaluationType = { id: '', description: '', coefficient: 1 };
            },
            error: () => this.notify.showError(this.translate.instant('error.title'), this.translate.instant('recommendedCandidates.messages.error.createEvaluationTypeFailed'))
        });
    }

    onGlobalFilter(event: Event, dt: any) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }

    private loadRecommendedCandidatesForOffer(offerId: string): void {
        this.loader.show(this.translate.instant('recommendedCandidates.loading'));
        this.candidateService.getRecommendedCandidates(offerId).subscribe({
            next: (res) => {
                this.candidates = res;
                this.loader.hide();
            },
            error: () => {
                this.notify.showError(this.translate.instant('error.title'), this.translate.instant('recommendedCandidates.messages.error.loadCandidatesFailed'));
                this.loader.hide();
            }
        });
    }

    sortByName() {
        this.nameSortAsc = !this.nameSortAsc;
        this.candidates = [...this.candidates].sort((a, b) => (this.nameSortAsc ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName)));
    }

    sortByTech() {
        this.techSortAsc = !this.techSortAsc;
        this.candidates = [...this.candidates].sort((a, b) => (this.techSortAsc ? (a.mainTech || '').localeCompare(b.mainTech || '') : (b.mainTech || '').localeCompare(a.mainTech || '')));
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
        this.interviewForm.reset({
            description: '',
            schedule: null,
            criteria: [],
            totalQuestions: 10,
            duration: 30
        });
    }

    confirmConvocation() {
        if (this.interviewForm.invalid) {
            this.notify.showError(this.translate.instant('error.title'), this.translate.instant('recommendedCandidates.messages.error.validation.fillRequiredFields'));
            return;
        }

        const { schedule, description, duration, totalQuestions, criteria } = this.interviewForm.value;

        const payload: CreateInterview = {
            scheduledAt: schedule,
            description,
            feedbackGeneral: '',
            comment: '',
            estimatedDuration: duration,
            candidateId: this.selectedCandidate.id,
            offerId: this.offerId,
            numberOfQuestions: totalQuestions
        };

        const evaluationTypeRequest: GenerateInterviewQuestionsRequest = {
            evaluationTypesIds: criteria
        };

        this.isCreating = true;

        this.interviewService
            .createInterview(payload)
            .pipe(
                tap((createdInterview) => console.log('created interview:', createdInterview)),
                catchError((err) => this.handleError('Creating Interview', err)),

                switchMap((createdInterview) =>
                    this.interviewService.generateInterviewQuestions(createdInterview.id, evaluationTypeRequest).pipe(
                        tap((generatedQuestions) => console.log('generated questions:', generatedQuestions)),
                        catchError((err) => this.handleError('Generate Questions', err)),
                        map(() => createdInterview)
                    )
                ),

                switchMap((createdInterview) =>
                    this.interviewService.generateAndSaveInterviewLink(createdInterview).pipe(
                        tap((link) => console.log('link:', link)),
                        catchError((err) => this.handleGenerateAndSaveLinkError(err)),
                        map(() => createdInterview)
                    )
                ),

                switchMap((createdInterview) =>
                    this.interviewService.sendEmail(createdInterview).pipe(
                        tap((email) => console.log('email sent:', email)),
                        catchError((err) => this.handleSendEmailError(err))
                    )
                ),

                tap(() => {
                    this.notify.showSuccess(this.translate.instant('success.title'), this.translate.instant('recommendedCandidates.messages.success.interviewCreated'));
                    this.showConvocateDialog = false;
                }),

                finalize(() => (this.isCreating = false))
            )
            .subscribe({
                error: () => this.notify.showError(this.translate.instant('error.title'), this.translate.instant('recommendedCandidates.messages.error.interviewCreationFailed'))
            });
    }

    private handleGenerateAndSaveLinkError(err: Error): Observable<never> {
        const message = err.message;
        if (
            message === ERROR_MESSAGES.INTERVIEW.INVALID_CANDIDATE_ID ||
            message === ERROR_MESSAGES.INTERVIEW.INVALID_OFFER_ID ||
            message === ERROR_MESSAGES.INTERVIEW.INVALID_INTERVIEW_ID ||
            message === ERROR_MESSAGES.INTERVIEW.INVALID_SCHEDULED_DATE ||
            message.includes('generate')
        ) {
            console.error('Failed to generate interview link:', err);
            this.notify.showError(this.translate.instant('recommendedCandidates.messages.error.linkGeneration'), message);
        } else if (message.includes('save')) {
            console.error('Failed To save the generated link');
            this.notify.showError(this.translate.instant('recommendedCandidates.messages.error.savingLink'), message);
        } else {
            console.error('Unexpected error during link generation:', err);
            this.notify.showError(this.translate.instant('recommendedCandidates.messages.error.unexpected'), message || 'An unexpected error occurred.');
        }
        return EMPTY;
    }

    private handleSendEmailError(err: Error): Observable<never> {
        const message = err.message;
        if (message === ERROR_MESSAGES.EMAIL.INVALID_CANDIDATE_NAME || message === ERROR_MESSAGES.EMAIL.INVALID_OFFER_TITLE || message === ERROR_MESSAGES.EMAIL.INVALID_SCHEDULED_DATE || message.includes('email')) {
            console.error('Failed to send email:', err);
            this.notify.showError(this.translate.instant('recommendedCandidates.messages.error.emailSending'), message);
        } else {
            console.error('Unexpected error during email sending:', err);
            this.notify.showError(this.translate.instant('recommendedCandidates.messages.error.unexpected'), message || 'An unexpected error occurred.');
        }
        return EMPTY;
    }

    private handleError(context: string, err: Error): Observable<never> {
        console.error(`${context} error:`, err);
        this.notify.showError(`${context} Error`, err.message || 'An unexpected error occurred.');
        return EMPTY;
    }

    // Helper method to get translated proficiency level
    getProficiencyLevelText(level: string): string {
        return this.translate.instant(`recommendedCandidates.detailsDialog.proficiencyLevels.${level}`);
    }

    // Helper method to get translated language level
    getLanguageLevelText(level: string): string {
        return this.translate.instant(`recommendedCandidates.detailsDialog.languageLevels.${level}`);
    }
}
