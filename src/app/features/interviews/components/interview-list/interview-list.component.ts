import { Component, OnInit } from '@angular/core';
import { InterviewService } from '../../../../core/services/interview.service';
import { CandidateService } from '../../../../core/services/candidate.service';
import { InterviewInstance } from '../../../../core/models/interview-instance';
import { OfferService } from '../../../../core/services/offer.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RouterModule, Router } from '@angular/router';
import { tap, switchMap, catchError, finalize } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/utils/notification.service';
import { ERROR_MESSAGES } from '../../../../core/constants/error-messages.const';
import { Observable, EMPTY } from 'rxjs';
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { ConfirmationModalService } from '../../../../core/services/utils/confirmation.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { InterviewFilterService } from '../../../../core/services/interview-filter.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-interview-list',
    standalone: true,
    imports: [CommonModule, TableModule, TooltipModule, ButtonModule, DialogModule, FormsModule, InputTextModule, ToastModule, DatePipe, ConfirmDialogModule, RouterModule, LoaderComponent, MultiSelectModule, DatePickerModule, TranslateModule],
    providers: [MessageService, ConfirmationService, NotificationService],
    templateUrl: './interview-list.component.html',
    styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
    interviews: InterviewInstance[] = [];
    filteredInterviews: InterviewInstance[] = [];
    isLoading$!: any;
    loadingMessage$!: any;

    scheduledDateFilter: Date | null = null;

    selectedTechFilters: any[] = [];
    selectedTitleFilters: any[] = [];

    searchQuery = '';

    now: Date = new Date();
    techOptions: { label: string; value: string }[] = [];
    titleOptions: { label: string; value: string }[] = [];

    showCommentDialog: boolean = false;
    tempComment: string = '';
    selectedCommentInterview: InterviewInstance | null = null;

    isGeneratingLink = false;

    candidateNameSortAsc: boolean = false;
    offerTitleSortAsc: boolean = false;
    candidateMainTechSortAsc: boolean = false;

    showDetailsDialog = false;
    selectedInterview: any = null;

    constructor(
        private interviewFilterService: InterviewFilterService,
        private interviewService: InterviewService,
        private candidateService: CandidateService,
        private confirmationService: ConfirmationService,
        private offerService: OfferService,
        private router: Router,
        private notify: NotificationService,
        private loaderService: LoaderService,
        private confirmationModalService: ConfirmationModalService,
        private translate: TranslateService // Add this
    ) {}

    ngOnInit(): void {
        this.loadMainTechOptions();
        this.loadTitleOptions();
        this.loadInterviews();
        setInterval(() => (this.now = new Date()), 60000);

        this.isLoading$ = this.loaderService.isLoading$;
        this.loadingMessage$ = this.loaderService.loadingMessage$;
    }

    loadMainTechOptions(): void {
        this.candidateService.getAllMainTech().subscribe({
            next: (techList) => {
                this.techOptions = techList.map((tech) => ({ label: tech, value: tech }));
            },
            error: () => {
                this.notify.showError(this.translate.instant('error.title'), this.translate.instant('interviewList.messages.error.loadMainTechFailed'));
            }
        });
    }

    loadTitleOptions(): void {
        this.offerService.getAllTitles().subscribe({
            next: (titles) => {
                this.titleOptions = titles.map((title) => ({ label: title, value: title }));
            },
            error: () => {
                this.notify.showError(this.translate.instant('error.title'), this.translate.instant('interviewList.messages.error.loadTitlesFailed'));
            }
        });
    }

    onSearch() {
        this.filteredInterviews = this.interviewFilterService.searchInterviews(this.interviews, this.searchQuery);
    }

    loadInterviews(): void {
        this.loaderService.show(this.translate.instant('interviewList.loading'));
        this.interviewService.getInterviews().subscribe((data) => {
            this.interviews = data;
            this.filteredInterviews = this.interviews;
            this.loaderService.hide();
        });
    }

    applyFilters(): void {
        this.filteredInterviews = this.interviews.filter((interview) => {
            const matchTech = !this.selectedTechFilters || this.selectedTechFilters.length === 0 || this.selectedTechFilters.includes(interview.candidateMainTech);
            const matchTitle = !this.selectedTitleFilters || this.selectedTitleFilters.length === 0 || this.selectedTitleFilters.includes(interview.offerTitle);
            const matchDate = !this.scheduledDateFilter || this.formatDate(interview.scheduledAt) === this.formatDate(this.scheduledDateFilter);
            return matchTech && matchTitle && matchDate;
        });
    }

    private formatDate(date: Date | string | null): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    resetFilters(): void {
        this.selectedTechFilters = [];
        this.selectedTitleFilters = [];
        this.scheduledDateFilter = null;
        this.filteredInterviews = this.interviews;
    }

    clear(): void {
        this.searchQuery = '';
    }

    getRemainingHours(expiryDate?: Date): string {
        if (!expiryDate) return this.translate.instant('interviewList.status.na');
        const diff = new Date(expiryDate).getTime() - new Date().getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours > 0 ? `${hours}h` : this.translate.instant('interviewList.status.expired');
    }

    generateLinkAndSendEmail(interview: InterviewInstance): void {
        this.isGeneratingLink = true;

        this.interviewService
            .generateAndSaveInterviewLink(interview)
            .pipe(
                tap((link) => {
                    console.log('Generated Link:', link);
                    interview.link = link;
                }),
                catchError((err) => this.handleGenerateAndSaveLinkError(err)),

                switchMap(() => this.interviewService.sendEmail(interview).pipe(catchError((err) => this.handleSendEmailError(err)))),

                finalize(() => {
                    this.isGeneratingLink = false;
                })
            )
            .subscribe({
                next: (res) => {
                    this.notify.showSuccess(this.translate.instant('interviewList.messages.success.emailSent'), res);
                }
            });
    }

    AddCommentPopup(interview: InterviewInstance): void {
        this.tempComment = interview.comment || '';
        this.selectedCommentInterview = interview;
        this.showCommentDialog = true;
    }

    ViewInterviewPopup(interview: InterviewInstance): void {
        this.selectedInterview = interview;
        this.showDetailsDialog = true;
    }

    saveComment(): void {
        if (!this.selectedCommentInterview) return;

        const id = this.selectedCommentInterview.id.toString();
        const comment = this.tempComment;

        this.interviewService.AddComment(id, comment).subscribe({
            next: () => {
                this.selectedCommentInterview!.comment = comment;
                this.showCommentDialog = false;
                this.notify.showSuccess(this.translate.instant('success.title'), this.translate.instant('interviewList.messages.success.commentSaved'));
            },
            error: (err) => {
                this.notify.showError(this.translate.instant('error.title'), this.translate.instant('interviewList.messages.error.saveCommentFailed'));
                console.error('Save comment failed:', err);
            }
        });
    }

    confirmDelete(interview: InterviewInstance): void {
        this.confirmationModalService.confirmDelete(() => {
            this.deleteInterview(interview);
        }, 'interview');
    }

    deleteInterview(interview: InterviewInstance): void {
        this.interviewService.deleteInterview(interview.id.toString()).subscribe({
            next: () => {
                this.interviews = this.interviews.filter((i) => i.id !== interview.id);
                this.filteredInterviews = this.filteredInterviews.filter((i) => i.id !== interview.id);
                this.notify.showSuccess(this.translate.instant('success.title'), this.translate.instant('interviewList.messages.success.deleted'));
            },
            error: () => {
                this.notify.showError(this.translate.instant('error.title'), this.translate.instant('interviewList.messages.error.deleteFailed'));
            }
        });
    }

    shouldShowEvaluation(interview: InterviewInstance): boolean {
        return !!interview.endTime;
    }

    openEvaluation(interview: InterviewInstance): void {
        sessionStorage.setItem(`interview_${interview.id}`, JSON.stringify(interview));

        const url = this.router.serializeUrl(this.router.createUrlTree(['/evaluation', interview.id]));
        window.open(url, '_blank');
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
            this.notify.showError(this.translate.instant('interviewList.messages.error.linkGeneration'), message);
        } else if (message.includes('save')) {
            console.error('Failed To save the generated link');
            this.notify.showError(this.translate.instant('interviewList.messages.error.savingLink'), message);
        } else {
            console.error('Unexpected error during link generation:', err);
            this.notify.showError(this.translate.instant('interviewList.messages.error.unexpected'), message || 'An unexpected error occurred.');
        }
        return EMPTY;
    }

    private handleSendEmailError(err: Error): Observable<never> {
        const message = err.message;
        if (message === ERROR_MESSAGES.EMAIL.INVALID_CANDIDATE_NAME || message === ERROR_MESSAGES.EMAIL.INVALID_OFFER_TITLE || message === ERROR_MESSAGES.EMAIL.INVALID_SCHEDULED_DATE || message.includes('email')) {
            console.error('Failed to send email:', err);
            this.notify.showError(this.translate.instant('interviewList.messages.error.emailSending'), message);
        } else {
            console.error('Unexpected error during email sending:', err);
            this.notify.showError(this.translate.instant('interviewList.messages.error.unexpected'), message || 'An unexpected error occurred.');
        }
        return EMPTY;
    }

    private toDate(v: Date | string | null | undefined): Date | null {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    getDurationLabel(interview: InterviewInstance): string {
        const end = this.toDate(interview.endTime);
        const start = this.toDate(interview.startTime) ?? this.toDate(interview.scheduledAt);

        if (!end || !start) return '—';

        const diffMs = end.getTime() - start.getTime();
        if (diffMs <= 0) return '—';

        const totalMin = Math.round(diffMs / (1000 * 60));
        const hours = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
    }

    sortInterviewsByCandidateName(asc: boolean = true) {
        this.candidateNameSortAsc = !this.candidateNameSortAsc;

        this.filteredInterviews.sort((a, b) => (this.candidateNameSortAsc ? a.candidateFullName.localeCompare(b.candidateFullName) : b.candidateFullName.localeCompare(a.candidateFullName)));
    }

    sortInterviewsByCandidateMainTech() {
        this.candidateMainTechSortAsc = !this.candidateMainTechSortAsc;
        this.filteredInterviews.sort((a, b) => (this.candidateMainTechSortAsc ? a.candidateMainTech.localeCompare(b.candidateMainTech) : b.candidateMainTech.localeCompare(a.candidateMainTech)));
    }

    sortInterviewsByOfferTitle() {
        this.offerTitleSortAsc = !this.offerTitleSortAsc;
        this.filteredInterviews.sort((a, b) => (this.offerTitleSortAsc ? a.offerTitle.localeCompare(b.offerTitle) : b.offerTitle.localeCompare(a.offerTitle)));
    }
}
