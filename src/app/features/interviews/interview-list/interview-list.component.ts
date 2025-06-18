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
  selectedCandidateEmail = '';
  selectedCandidateName = '';
  mailSubject = '';
  mailBody = '';
  mailHeader = '';
  mailFooter = '';

  mainTechFilter: string | null = null;
  statusFilter: boolean | null = null;
  startDateFilter: Date | null = null;

  now: Date = new Date();
  techOptions: { label: string; value: string }[] = [];
  statusOptions = [
    { label: 'Passed', value: true },
    { label: 'Not Yet', value: false }
  ];

  showCommentDialog: boolean = false;
  commentInput!: string;
  tempComment: string = '';
  selectedCommentInterview: InterviewInstance | null = null;


  constructor(
    private interviewService: InterviewService,
    private candidateService: CandidateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadMainTechOptions();
    this.loadInterviews();
    setInterval(() => (this.now = new Date()), 60000);
  }

  loadMainTechOptions(): void {
    this.candidateService.getAllMainTech().subscribe({
      next: (techList) => {
        this.techOptions = techList.map((tech) => ({
          label: tech,
          value: tech
        }));
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
      this.filteredInterviews = this.interviews;
      this.loading = false;
    });
  }

  applyFilters(): void {
    this.filteredInterviews = this.interviews.filter((interview) => {
      const matchTech = !this.mainTechFilter || interview.mainTech === this.mainTechFilter;
      const matchStatus = this.statusFilter === null || interview.isPassed === this.statusFilter;
      const matchDate =
        !this.startDateFilter ||
        new Date(interview.startedAt).toDateString() === this.startDateFilter.toDateString();
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

  getRemainingHours(expiryDate?: Date): string {
    if (!expiryDate) return 'N/A';
    const now = new Date();
    const diff = new Date(expiryDate).getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h` : 'Expired';
  }

  viewDetails(interview: InterviewInstance): void {
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
    const link = interview.interviewLink?.text ?? '[Link Not Available]';

    this.mailHeader = 'Dear ' + this.selectedCandidateName + ',';
    this.mailBody = `We hope this mail finds you well.\n\nInterview scheduled on: ${formattedDate} at ${formattedTime}\n\nLink: ${link}`;
    this.mailFooter = 'Best Regards,\nNTT Data Morocco';

    this.mailDialogVisible = true;
  }

  confirmSendMail(): void {
    this.interviewService.sendMail(this.selectedCandidateEmail, this.mailSubject, this.mailBody).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Mail Sent',
          detail: 'Mail sent successfully!'
        });
        this.mailDialogVisible = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send mail.'
        });
      }
    });
  }

  generateNewLink(interview: InterviewInstance): void {
    this.interviewService.generateNewLink(interview.id.toString()).subscribe({
      next: (response) => {
        interview.interviewLink = {
          id: response.linkId,
          text: response.newLink,
          generationCount: (interview.interviewLink?.generationCount ?? 0) + 1,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        interview.startedAt = new Date();
        this.messageService.add({
          severity: 'success',
          summary: 'Link Generated',
          detail: 'A new link has been successfully generated.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Link Generation Failed',
          detail: 'Could not generate new link.'
        });
      }
    });
  }

  canGenerateLink(interview: InterviewInstance): boolean {
    const now = new Date();
    if (!interview.interviewLink) return true;
    const isExpired = new Date(interview.interviewLink.expiresAt).getTime() <= now.getTime();
    const count = interview.interviewLink.generationCount ?? 0;
    return isExpired && count < 3;
  }

  getGenerateLinkTooltip(interview: InterviewInstance): string {
    const count = interview.interviewLink?.generationCount ?? 0;
    if (count >= 3) return 'You’ve reached the max of 3 link generations.';
    if (interview.interviewLink?.expiresAt && new Date(interview.interviewLink.expiresAt).getTime() > Date.now()) {
      return 'Link is still valid.';
    }
    return 'Generate New Link';
  }

  AddCommentPopup(interview: InterviewInstance): void {
    this.tempComment = interview.comment || '';
    this.selectedCommentInterview = interview;
    this.showCommentDialog = true;
  }

  saveComment(): void {
    if (!this.selectedCommentInterview) return;

    const updatedInterview = {
      ...this.selectedCommentInterview,
      comment: this.tempComment
    };

    this.interviewService.AddComment(updatedInterview.id.toString(), updatedInterview).subscribe({
      next: () => {
        this.selectedCommentInterview!.comment = this.tempComment;
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
        this.interviews = this.interviews.filter(i => i.id !== interview.id);
        this.filteredInterviews = this.filteredInterviews.filter(i => i.id !== interview.id);
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
