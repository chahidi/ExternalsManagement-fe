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
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RouterModule } from '@angular/router'; 


@Component({
  
    selector: 'app-interview-list',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        TooltipModule,
        ButtonModule,
        DialogModule,
        FormsModule,
        InputTextModule,
        InputTextarea,
        DropdownModule,
        CalendarModule,
        ToastModule,
        DatePipe,
        ConfirmDialogModule,
        RouterModule
      ],

    providers: [MessageService, ConfirmationService],
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
  now: Date = new Date();
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
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadMainTechOptions();
    this.loadInterviews();
    setInterval(() => {
      this.now = new Date();
    }, 60000);
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
    const formattedDate = interviewDate.toLocaleDateString('en-GB');
    const formattedTime = interviewDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
    const to = this.selectedCandidateEmail;
    const subject = this.mailSubject;
    const body = this.mailBody;

    this.interviewService.sendMail(to, subject, body).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Mail Sent',
          detail: 'Mail sent successfully!'
        });
        this.mailDialogVisible = false;
      },
      error: (err) => {
        const errorMsg = err?.error?.message || 'Unknown error';
        this.messageService.add({
          severity: 'error',
          summary: 'Error Sending Mail',
          detail: `An unexpected error occurred, please try later!\n${errorMsg}`
        });
      }
    });
  }


  generateNewLink(interview: InterviewInstance): void {
    this.interviewService.generateNewLink(interview.id.toString()).subscribe({
      next: (response) => {
        console.log(response);
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

  canGenerateLink(interview: InterviewInstance): boolean {
    const now = new Date();
    const isExpired = new Date(interview.expiresAt).getTime() <= now.getTime();
    const linkGenerationCount = interview.linkGenerationCount ?? 0;
    const generationLimitReached = linkGenerationCount >= 3;

    return isExpired && !generationLimitReached;
  }
  getGenerateLinkTooltip(interview: InterviewInstance): string {
    const now = new Date();
    if ((interview.linkGenerationCount ?? 0) >= 3) {
      return 'You’ve reached the maximum of 3 link generations.';
    }

    if (interview.expiresAt && new Date(interview.expiresAt).getTime() > now.getTime()) {
      return 'Link is still valid. You can’t generate a new one yet.';
    }

    return 'Generate New Link';
  }



  editInterview(interview: InterviewInstance): void {
    console.log('Edit clicked:', interview);
  }

  deleteInterview(interview: InterviewInstance): void {
    this.interviewService.deleteInterview(interview.id.toString()).subscribe({
      next: () => {
        this.interviews = this.interviews.filter(i => i.id !== interview.id);
        this.filteredInterviews = this.filteredInterviews.filter(i => i.id !== interview.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Interview deleted successfully!'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete interview'
        });
        console.error('Delete failed:', err);
      }
    });
  }


  confirmDeleteInterview(interview: InterviewInstance): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this interview?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button p-button-success',
      rejectButtonStyleClass: 'p-button p-button-danger',
      accept: () => this.deleteInterview(interview),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Interview not deleted'
        });
      }
    });
  }

}
