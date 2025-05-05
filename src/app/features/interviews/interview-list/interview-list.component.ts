import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
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
    InputTextModule,
    DatePipe
  ],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
  interviews: InterviewInstance[] = [];
  loading = true;

  // Mail popup variables
  mailDialogVisible = false;
  selectedCandidateEmail = '';
  selectedCandidateName = '';
  mailSubject = '';
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
    this.mailSubject = 'Interview Invitation';
    this.mailContent = `Dear ${this.selectedCandidateName},\n\nWe hope you're doing well.\n\nPlease find the link to access your scheduled interview:\n${interview.interviewLink}\n\nBest regards,\nRecruitment Team`;
    this.mailDialogVisible = true;
  }

  confirmSendMail(): void {
    console.log('To:', this.selectedCandidateEmail);
    console.log('Subject:', this.mailSubject);
    console.log('Message:', this.mailContent);
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
