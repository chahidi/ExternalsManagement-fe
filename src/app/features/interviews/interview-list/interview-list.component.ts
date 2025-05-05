import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InterviewService } from '../../../core/services/interview.service';
import { InterviewInstance } from '../../../core/models/interview-instance';

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DatePipe
  ],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
  interviews: InterviewInstance[] = [];
  loading = true;

  constructor(private interviewService: InterviewService) {}

  ngOnInit(): void {
    this.interviewService.getInterviews().subscribe(data => {
      console.log('Loaded interviews:', data); 
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
}
