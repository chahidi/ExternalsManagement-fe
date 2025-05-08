import { Component, OnInit } from '@angular/core';
import { InterviewService } from '../../../core/services/interview.service';
import { InterviewInstance } from '../../../core/models/interview-instance';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';

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
    DatePipe
  ],
  providers: [MessageService],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
  interviews: InterviewInstance[] = [];
  loading = true;

  displayEditDialog = false;
  selectedInterview: InterviewInstance | null = null;

  mailDialogVisible = false;
  selectedCandidateEmail = '';
  selectedCandidateName = '';
  mailSubject = '';
  mailContent = '';

  constructor(private interviewService: InterviewService) {}

  ngOnInit(): void {
    this.interviewService.getInterviews().subscribe((data) => {
      this.interviews = data.map(interview => ({
        ...interview,
        linkGenerationCount: interview.linkGenerationCount ?? 0
      }));
      this.loading = false;
    });
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

    const interviewTime = interview.startedAt
      ? new Date(interview.startedAt).toLocaleString()
      : '[Scheduled Time]';

    const link = interview.interviewLink ?? '[Link Not Available]';

    this.mailContent = `Dear,

We hope this mail finds you well, find below the link to access your interview.
The interview is scheduled at ${interviewTime}

! Note: the link is valid only 24h, if the link is expired you can't access !
${link}

Thanks & Best Regards
NTT DATA MOROCCO`;

    this.mailDialogVisible = true;
  }

  confirmSendMail(): void {
    console.log('To:', this.selectedCandidateEmail);
    console.log('Subject:', this.mailSubject);
    console.log('Message:', this.mailContent);
    this.mailDialogVisible = false;
  }

  generateNewLink(interview: InterviewInstance): void {
    if (!('linkGenerationCount' in interview)) {
      (interview as any).linkGenerationCount = 1;
    } else {
      (interview as any).linkGenerationCount++;
    }

    console.log(`Generating new link for token: ${interview.token}`);
    console.log(`Link has been generated ${interview.linkGenerationCount} times.`);
  }

  editInterview(interview: InterviewInstance): void {
    console.log('Edit clicked:', interview);
  }

  deleteInterview(interview: InterviewInstance): void {
    console.log('Delete clicked:', interview);
  }
}
