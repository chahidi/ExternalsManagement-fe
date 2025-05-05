import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../../core/services/interview.service';
import { InterviewInstance } from '../../../core/models/interview-instance';

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
    DatePipe
  ],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
  interviews: InterviewInstance[] = [];
  loading = true;

  mailDialogVisible = false;
  selectedCandidateEmail = '';
  selectedCandidateName = '';
  mailContent = '';

  constructor(private interviewService: InterviewService) {}

  ngOnInit(): void {
    this.interviewService.getInterviews().subscribe(data => {
      this.interviews = data;
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
    console.log('Viewing details for:', interview);
  }

  sendMail(interview: InterviewInstance): void {
    this.selectedCandidateEmail = this.getEmail(interview.candidate);
    this.selectedCandidateName = interview.candidate.fullName;
    this.mailContent = `Dear ${this.selectedCandidateName},

  We hope you're doing well.

  Please find below the link to access your scheduled technical interview:

  🔗 ${interview.interviewLink}

  Make sure to join on time and ensure your microphone and camera are functioning properly.

  If you have any questions, feel free to reach out.

  Best regards,
  Recruitment Team`;
    this.mailDialogVisible = true;
  }

  confirmSendMail(): void {
    console.log('Mail sent to:', this.selectedCandidateEmail);
    console.log('Mail content:', this.mailContent);
    this.mailDialogVisible = false;
  }

  generateNewLink(interview: InterviewInstance): void {
    console.log('Generating new link for:', interview.token);
  }

  editInterview(interview: InterviewInstance): void {
    console.log('Edit clicked:', interview);
  }

  deleteInterview(interview: InterviewInstance): void {
    console.log('Delete clicked:', interview);
  }
}
