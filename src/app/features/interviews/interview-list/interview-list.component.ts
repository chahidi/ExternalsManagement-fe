import { Component, OnInit } from '@angular/core';
import { InterviewService } from '../../../core/services/interview.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { InterviewInstance } from '../../../core/models/interview-instance';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-interview-list',
    standalone: true,
    imports: [CommonModule, TableModule, TooltipModule, ButtonModule, DialogModule, FormsModule, InputTextModule, InputTextarea, DropdownModule, CalendarModule, ToastModule, DatePipe],
    providers: [MessageService],
    templateUrl: './interview-list.component.html',
    styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
    interviews: InterviewInstance[] = [];
    filteredInterviews: InterviewInstance[] = [];
    loading = true;

    displayEditDialog = false;
    selectedInterview: InterviewInstance | null = null;

    mailDialogVisible = false;
    selectedCandidateEmail = '';
    selectedCandidateName = '';
    mailSubject = '';
    mailContent = '';
    mailHeader = '';
    mailBody = '';
    mailFooter = '';



    mainTechFilter: string | null = null;
    statusFilter: boolean | null = null;
    startDateFilter: Date | null = null;

    techOptions: { label: string; value: string }[] = [];

    statusOptions = [
        { label: 'Passed', value: true },
        { label: 'Not Yet', value: false }
    ];

    constructor(
        private interviewService: InterviewService,
        private candidateService: CandidateService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadMainTechOptions();
        this.loadInterviews();
    }

    loadMainTechOptions(): void {
        this.candidateService.getAllMainTech().subscribe({
            next: (techList) => {
                this.techOptions = techList.map((tech) => ({
                    label: tech,
                    value: tech
                }));
            },
            error: (err) => {
                console.error('Failed to load tech list', err);
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
            this.interviews = data.map((interview) => ({
                ...interview,
                linkGenerationCount: interview.linkGenerationCount ?? 0
            }));
            this.filteredInterviews = this.interviews;
            this.loading = false;
        });
    }

    applyFilters(): void {
        this.filteredInterviews = this.interviews.filter((interview) => {
            const matchTech = !this.mainTechFilter || interview.mainTech === this.mainTechFilter;
            const matchStatus = this.statusFilter === null || interview.isPassed === this.statusFilter;
            const matchDate = !this.startDateFilter || new Date(interview.startedAt).toDateString() === this.startDateFilter.toDateString();
            return matchTech && matchStatus && matchDate;
        });
    }

    resetFilters(): void {
        this.mainTechFilter = null;
        this.statusFilter = null;
        this.startDateFilter = null;
        this.filteredInterviews = this.interviews;
    }

    getEmail(candidate: any): string {
        const email = candidate.contacts?.find((c: any) => c.contactType === 'Email');
        return email ? email.contactValue : 'N/A';
    }

    getRemainingHours(expiryDate: Date): string {
        const now = new Date();
        const diff = new Date(expiryDate).getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours > 0 ? `${hours}h` : 'Expired';
    }

    viewDetails(interview: InterviewInstance): void {
        if (!('linkGenerationCount' in interview)) {
            (interview as any).linkGenerationCount = 0;
        }
        this.selectedInterview = interview;
        this.displayEditDialog = true;
    }

    sendMail(interview: InterviewInstance): void {
        this.selectedCandidateEmail = this.getEmail(interview.candidate);
        this.selectedCandidateName = interview.candidate.fullName;
        this.mailSubject = 'Interview Invitation';

        const interviewDate = new Date(interview.startedAt ?? new Date());
        const formattedDate = interviewDate.toLocaleDateString('en-GB'); // dd-MM-yyyy
        const formattedTime = interviewDate.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }); // HH:mm

        const link = interview.interviewLink ?? '[Link Not Available]';

        this.mailHeader = 'Dear,';

        this.mailBody = `We hope this mail finds you well.

      Please find below the link to access your interview.

       Interview scheduled on: ${formattedDate} at ${formattedTime}

      Note: the link is valid for only 24 hours. After that, access will be blocked.

       ${link}`;

        this.mailFooter = 'Best Regards,\n\nNTT signature';

        this.mailDialogVisible = true;
      }



      confirmSendMail(): void {
        const fullMail = `${this.mailHeader}\n\n${this.mailBody}\n\n${this.mailFooter}`;

        console.log('To:', this.selectedCandidateEmail);
        console.log('Subject:', this.mailSubject);
        console.log('Message:', fullMail);

        this.mailDialogVisible = false;
      }

    generateNewLink(interview: InterviewInstance): void {
        this.interviewService.generateNewLink(interview.id.toString()).subscribe({
          next: (response) => {
            interview.interviewLink = response.newLink;
            interview.linkGenerationCount = (interview.linkGenerationCount ?? 0) + 1;
            interview.startedAt = new Date();
            interview.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'New link is generated with success'
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to generate new link'
            });
            console.error('Link generation failed:', err);
          }
        });
      }

    editInterview(interview: InterviewInstance): void {
        console.log('Edit clicked:', interview);
    }

    deleteInterview(interview: InterviewInstance): void {
        console.log('Delete clicked:', interview);
    }
}
