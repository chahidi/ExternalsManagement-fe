
import { Component, OnInit } from '@angular/core';
import { InterviewInstance } from '../../../core/models/interview-instance';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule
  ],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent implements OnInit {
  interviews: InterviewInstance[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    // Mock data
    this.interviews = [
      {
        id: 1,
        interviewLink: 'https://interview.ai/app/abc123',
        mainTech: 'Angular',
        startedAt: new Date('2025-04-29T10:00:00Z'),
        submittedAt: new Date('2025-04-29T10:45:00Z'),
        isPassed: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        token: 'abc123',
        candidate: {
          id: 'cand-001',
          fullName: 'Sara Benali',
          birthDate: '1998-07-15',
          yearsOfExperience: 3,
          gender: 'Female',
          mainTech: 'Angular',
          summary: '',
          contacts: [
            {
              id: 'cont-001',
              candidate: {} as any,
              contactType: 'Email',
              contactValue: 'sara@example.com'
            }
          ],
          experiences: [],
          skills: [],
          educations: [],
          languages: [],
          address: {
            id: '',
            street: '',
            postalCode: '',
            fullAddress: '',
            city: { id: '', name: '', country: { id: '', name: '', englishName: '', cities: [] } },
            country: { id: '', name: '', englishName: '', cities: [] },
            candidate: {} as any
          }
        }
      }
    ];

      // Circular references fix

    const c = this.interviews[0].candidate;
    c.contacts.forEach(contact => contact.candidate = c);
    c.address.candidate = c;

    this.loading = false;
  }

  getEmail(candidate: any): string {
    const emailContact = candidate.contacts?.find((c: any) => c.contactType === 'Email');
    return emailContact ? emailContact.contactValue : 'N/A';
  }

  getRemainingHours(expiryDate: Date): string {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    return hoursLeft > 0 ? `${hoursLeft}h` : 'Expired';
  }

  editInterview(interview: InterviewInstance): void {
    console.log('Edit clicked:', interview);
  }

  deleteInterview(interview: InterviewInstance): void {
    console.log('Delete clicked:', interview);
  }
}
