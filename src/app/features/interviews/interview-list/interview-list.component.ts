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
    DatePipe
  ],
  providers: [MessageService],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {

  interviews: InterviewInstance[] = [];
  filteredInterviews: InterviewInstance[] = [];
  loading = true;

  displayDetailsDialog: boolean = false;
  displayEditFormDialog = false;

  selectedInterview: InterviewInstance | null = null;

  isEditMode = false;
  mailDialogVisible = false;
  selectedCandidateEmail = '';
  selectedCandidateName = '';
  mailSubject = '';
  mailContent = '';
  isPassed = false;

  mainTechFilter: string | null = null;
  statusFilter: boolean | null = null;
  startDateFilter: Date | null = null;

  techOptions: { label: string, value: string }[] = [];

  statusOptions = [
    { label: 'Passed', value: true },
    { label: 'Not Yet', value: false }
  ];

  constructor(
    private interviewService: InterviewService,
    private candidateService: CandidateService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadMainTechOptions();
    this.loadInterviews();
  }

  loadMainTechOptions(): void {
    this.candidateService.getAllMainTech().subscribe({
      next: (techList) => {
        this.techOptions = techList.map(tech => ({
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
      this.interviews = data.map(interview => ({
        ...interview,
        linkGenerationCount: interview.linkGenerationCount ?? 0
      }));
      this.filteredInterviews = this.interviews;
      this.loading = false;
    });
  }

  applyFilters(): void {
    this.filteredInterviews = this.interviews.filter(interview => {
      const matchTech = !this.mainTechFilter || interview.mainTech === this.mainTechFilter;
      const matchStatus = this.statusFilter === null || interview.isPassed === this.statusFilter;
      const matchDate = !this.startDateFilter ||
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
    return candidate?.contacts?.[0]?.contactValue || '';
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
    this.displayDetailsDialog = true;
    this.isEditMode = false;

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
    this.interviewService.generateNewLink(interview.id.toString()).subscribe({
      next: (response) => {
        interview.interviewLink = response.newLink;
        interview.linkGenerationCount = (interview.linkGenerationCount ?? 0) + 1;

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
    this.selectedInterview = interview;
    this.displayEditFormDialog = true;
    console.log('Edit clicked:', interview);

  }

  deleteInterview(interview: InterviewInstance): void {
    console.log('Delete clicked:', interview);
  }

  saveInterviewChanges(): void {
    console.log("enter save method")
    if (!this.selectedInterview) return;
    console.log("zvrtbtb")
    this.loading = true;
    let interiewInstanceResp = this.interviewService.updateInterview(this.selectedInterview.id!, this.selectedInterview).subscribe({
      next: (updatedInterview) => {
        const index = this.interviews.findIndex(i => i.id === updatedInterview.id);
        if (index !== -1) {
          console.log("poooool")

          this.interviews[index] = updatedInterview;
          console.log('Updated Interview Comment:', updatedInterview.comment);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Interview updated successfully'
        });

        this.displayEditFormDialog = false;
        this.selectedInterview = null;
        this.loading = false;
      },
      error: (err) => {
        console.log("azert")
        console.error('Error updating interview:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update interview.'
        });
        console.log(interiewInstanceResp)



        this.loading = false;
      }
    });
  }

}