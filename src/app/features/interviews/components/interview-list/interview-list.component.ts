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
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RouterModule, Router } from '@angular/router';
import { tap, switchMap, catchError, finalize } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification.service';
import { ERROR_MESSAGES } from '../../../../core/constants/error-messages.const';
import { Observable, EMPTY } from 'rxjs';


@Component({
    selector: 'app-interview-list',
    standalone: true,
    imports: [CommonModule, TableModule, TooltipModule, ButtonModule, DialogModule, FormsModule, InputTextModule, DropdownModule, CalendarModule, ToastModule, DatePipe, ConfirmDialogModule, RouterModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './interview-list.component.html',
    styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
    interviews: InterviewInstance[] = [];
    filteredInterviews: InterviewInstance[] = [];
    loading = true;

    mainTechFilter: string | null = null;
    titleFilter: string | null = null;
    scheduledDateFilter: Date | null = null;

    now: Date = new Date();
    techOptions: { label: string; value: string }[] = [];
    titleOptions: { label: string; value: string }[] = [];


    showCommentDialog: boolean = false;
    tempComment: string = '';
    selectedCommentInterview: InterviewInstance | null = null;

    isGeneratingLink = false;

    constructor(
        private interviewService: InterviewService,
        private candidateService: CandidateService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private offerService: OfferService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadMainTechOptions();
        this.loadTitleOptions();
        this.loadInterviews();
        setInterval(() => (this.now = new Date()), 60000);
    }

    loadMainTechOptions(): void {
        this.candidateService.getAllMainTech().subscribe({
            next: (techList) => {
                this.techOptions = techList.map((tech) => ({ label: tech, value: tech }));
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load Main Tech options'
                });
            }
        });
    }

    loadTitleOptions(): void {
        this.offerService.getAllTitles().subscribe({
            next: (titles) => {
                this.titleOptions = titles.map((title) => ({ label: title, value: title }));
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load title options'
                });
            }
        });
    }

    loadInterviews(): void {
        this.interviewService.getInterviews().subscribe((data) => {
            this.interviews = data;
            this.filteredInterviews = this.interviews;
            this.loading = false;
        });
    }

    applyFilters(): void {
        this.filteredInterviews = this.interviews.filter((interview) => {
            const matchTech = !this.mainTechFilter || interview.candidate.mainTech === this.mainTechFilter;
            const matchTitle = !this.titleFilter || interview.offer?.title === this.titleFilter;
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
        this.mainTechFilter = null;
        this.titleFilter = null;
        this.scheduledDateFilter = null;
        this.filteredInterviews = this.interviews;
    }

    getRemainingHours(expiryDate?: Date): string {
        if (!expiryDate) return 'N/A';
        const diff = new Date(expiryDate).getTime() - new Date().getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours > 0 ? `${hours}h` : 'Expired';
    }

    generateLinkAndSendEmail(interview: InterviewInstance): void {
        this.isGeneratingLink = true;

        this.interviewService.generateInterviewLink(interview).pipe(
            tap(link => {
                console.log('Generated Link:', link);
                interview.link = link;
            }),
            catchError(err => this.handleGenerateLinkError(err)),

            switchMap(link =>
                this.interviewService.saveInterviewLink(interview.id, link).pipe(
                    tap(() => console.log('Link saved successfully')),
                    catchError(err => this.handleSaveLinkError(err))
                )
            ),

            switchMap(() =>
                this.interviewService.sendEmail(interview).pipe(
                    catchError(err => this.handleSendEmailError(err))
                )
            ),

            finalize(() => {
                this.isGeneratingLink = false;
            })
        ).subscribe({
            next: (res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Email Sent Successfully',
                    detail: res.message
                });
            }
        });
    }


    AddCommentPopup(interview: InterviewInstance): void {
        this.tempComment = interview.comment || '';
        this.selectedCommentInterview = interview;
        this.showCommentDialog = true;
    }

    saveComment(): void {
        if (!this.selectedCommentInterview) return;

        const id = this.selectedCommentInterview.id.toString();
        const comment = this.tempComment;

        this.interviewService.AddComment(id, comment).subscribe({
            next: () => {
                this.selectedCommentInterview!.comment = comment;
                this.showCommentDialog = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Comment Saved',
                    detail: 'Comment saved successfully!'
                });
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save comment'
                });
                console.error('Save comment failed:', err);
            }
        });
    }

    confirmDeleteInterview(interview: InterviewInstance): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this interview?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.deleteInterview(interview)
        });
    }

    deleteInterview(interview: InterviewInstance): void {
        this.interviewService.deleteInterview(interview.id.toString()).subscribe({
            next: () => {
                this.interviews = this.interviews.filter((i) => i.id !== interview.id);
                this.filteredInterviews = this.filteredInterviews.filter((i) => i.id !== interview.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Interview deleted successfully'
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete interview'
                });
            }
        });
    }

    shouldShowEvaluation(interview: InterviewInstance): boolean {
        return !!interview.endDate;
    }

    openEvaluation(interview: InterviewInstance): void {
        this.router.navigate(['/interviews/evaluation', interview.id], {
            state: { interview }
        });
    }


    private handleGenerateLinkError(err: Error): Observable<never> {
        const message = err.message;
        if (
            message === ERROR_MESSAGES.INTERVIEW.INVALID_CANDIDATE_ID ||
            message === ERROR_MESSAGES.INTERVIEW.INVALID_OFFER_ID ||
            message === ERROR_MESSAGES.INTERVIEW.INVALID_INTERVIEW_ID ||
            message === ERROR_MESSAGES.INTERVIEW.INVALID_SCHEDULED_DATE ||
            message.includes('generate')
        ) {
            console.error('Failed to generate interview link:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Link Generation Error',
                detail: message
            });
        } else {
            console.error('Unexpected error during link generation:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Unexpected Error',
                detail: message || 'An unexpected error occurred.'
            });
        }
        return EMPTY;
    }

    private handleSaveLinkError(err: Error): Observable<never> {
        const message = err.message;
        if (
            message.includes('save') ||
            message.includes('savelink') ||
            message.includes('/savelink')
        ) {
            console.error('Failed to save interview link:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Saving Link Error',
                detail: message
            });
        } else {
            console.error('Unexpected error during link saving:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Unexpected Error',
                detail: message || 'An unexpected error occurred.'
            });
        }
        return EMPTY;
    }

    private handleSendEmailError(err: Error): Observable<never> {
        const message = err.message;
        if (
            message === ERROR_MESSAGES.EMAIL.INVALID_CANDIDATE_NAME ||
            message === ERROR_MESSAGES.EMAIL.INVALID_OFFER_TITLE ||
            message === ERROR_MESSAGES.EMAIL.INVALID_SCHEDULED_DATE ||
            message.includes('email')
        ) {
            console.error('Failed to send email:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Email Sending Error',
                detail: message
            });
        } else {
            console.error('Unexpected error during email sending:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Unexpected Error',
                detail: message || 'An unexpected error occurred.'
            });
        }
        return EMPTY;
    }
}