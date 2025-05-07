import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InterviewService } from '../../../core/services/interview.service';
import { InterviewInstance } from '../../../core/models/interview-instance';
import { TooltipModule } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';


@Component({
    selector: 'app-interview-list',
    standalone: true,
    imports: [CommonModule, TableModule, TooltipModule, ButtonModule, DatePipe, Dialog],
    templateUrl: './interview-list.component.html',
    styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
    interviews: InterviewInstance[] = [];
    loading = true;
    displayEditDialog = false;
    selectedInterview: InterviewInstance | null = null;

    constructor(private interviewService: InterviewService) {}

    ngOnInit(): void {
        this.interviewService.getInterviews().subscribe((data) => {
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

    viewDetails(interview: InterviewInstance): void {
        this.selectedInterview = interview;
        this.displayEditDialog = true;
    }

    sendMail(interview: InterviewInstance): void {
        console.log('Sending mail to:', this.getEmail(interview.candidate));
    }

    generateNewLink(interview: InterviewInstance): void {
        console.log('Generating new link for token:', interview.token);
    }

    editInterview(interview: InterviewInstance): void {
        console.log('Edit clicked:', interview);
    }

    deleteInterview(interview: InterviewInstance): void {
        console.log('Delete clicked:', interview);
    }
}
