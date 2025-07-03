import { Component, OnInit } from '@angular/core';
import { InterviewService } from '../../../../core/services/interview.service';
import { CandidateService } from '../../../../core/services/candidate.service';
import { InterviewInstance } from '../../../../core/models/interview-instance';
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
import { RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators'; 

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
    //statusFilter: boolean | null = null;
    titleFilter: string | null = null;
    startDateFilter: Date | null = null;

    now: Date = new Date();
    techOptions: { label: string; value: string }[] = [];
    /* statusOptions = [
        { label: 'Passed', value: true },
        { label: 'Not Yet', value: false }
    ];
 */

    

    get titleOptions(): { label: string; value: string }[] {
        if (!this.interviews) return [];
  
        const titles = this.interviews
        .map(i => i.offer?.title)
        .filter((v, i, a) => !!v && a.indexOf(v) === i)
        .sort();

        return titles.map(title => ({ label: title, value: title }));
    }


    showCommentDialog: boolean = false;
    tempComment: string = '';
    selectedCommentInterview: InterviewInstance | null = null;

    constructor(
        private interviewService: InterviewService,
        private candidateService: CandidateService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadMainTechOptions();
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

    loadInterviews(): void {
        this.interviewService.getInterviews().subscribe((data) => {
            this.interviews = data;
            console.log("Loaded Interviews:", this.interviews);
            this.filteredInterviews = this.interviews;
            this.loading = false;
        });
    }

    applyFilters(): void {
        this.filteredInterviews = this.interviews.filter((interview) => {
            const matchTech = !this.mainTechFilter || interview.mainTech === this.mainTechFilter;
            const matchTitle = !this.titleFilter || interview.offer?.title === this.titleFilter;
            //const matchStatus = this.statusFilter === null || interview.isPassed === this.statusFilter;
            const matchDate = !this.startDateFilter || this.formatDate(interview.startedAt)=== this.formatDate(this.startDateFilter);
            return matchTech && matchTitle && matchDate;
        });
    }

    private formatDate(date: Date | string | null): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0]; 
    }


    resetFilters(): void {
        this.mainTechFilter = null;
        //this.statusFilter = null;
        this.titleFilter=null;
        this.startDateFilter = null;
        this.filteredInterviews = this.interviews;
    }

    getRemainingHours(expiryDate?: Date): string {
        if (!expiryDate) return 'N/A';
        const diff = new Date(expiryDate).getTime() - new Date().getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours > 0 ? `${hours}h` : 'Expired';
    }

    generateNewLink(interview: InterviewInstance): void {
        console.log('📩 Generating interview link for ID:', interview.id);

        this.interviewService
            .generateInterviewLink(interview)
            .pipe(
                switchMap((generatedLink) => {
                    console.log('✅ Generated Link:', generatedLink);
                    // send the email
                    return this.interviewService.sendEmail(interview);
                })
            )
            .subscribe({
                next: (res) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Email Sent',
                        detail: res.message
                    });
                },
                error: (err) => {
                    console.error('Link generation or email failed:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.message || 'Failed to generate link or send email.'
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
}
