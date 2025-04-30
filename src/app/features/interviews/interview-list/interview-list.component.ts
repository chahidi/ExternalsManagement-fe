// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-interview-list',
//   imports: [],
//   templateUrl: './interview-list.component.html',
//   styleUrl: './interview-list.component.scss'
// })
// export class InterviewListComponent {

// }






// import { Component } from '@angular/core';
// import { InterviewInstance } from '../../../core/models/interview-instance';
// import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';

// @Component({
//   selector: 'app-interview-list',
//   standalone: true,
//   templateUrl: './interview-list.component.html',
//   styleUrls: ['./interview-list.component.scss'],
//   imports: [ NgFor, NgClass, DatePipe]
// })
// export class InterviewListComponent {
//   interviews: InterviewInstance[] = [
//     {
//       id: 1,
//       mainTech: 'Angular',
//       interviewLink: 'https://interview.ai/app/abc123',
//       token: 'abc123',
//       startedAt: new Date('2025-04-29T10:00:00Z'),
//       submittedAt: new Date('2025-04-29T10:45:00Z'),
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//       isPassed: true,
//       candidate: {
//         id: 'cand-001',
//         fullName: 'Sara Benali',
//         birthDate: '1998-07-15',
//         yearsOfExperience: 3,
//         gender: 'Female',
//         mainTech: 'Angular',
//         summary: 'Frontend developer with Angular experience.',
//         contacts: [
//           {
//             id: 'cont-001',
//             candidate: {} as any,
//             contactType: 'Email',
//             contactValue: 'sara@example.com'
//           }
//         ],
//         experiences: [
//           {
//             id: 'exp-001',
//             candidate: {} as any,
//             companyName: 'InovaTech',
//             position: 'Frontend Developer',
//             startDate: '2022-01-01',
//             endDate: '2024-03-01',
//             description: 'Built Angular apps for the finance sector.'
//           }
//         ],
//         skills: [
//           {
//             id: 'skl-001',
//             candidate: {} as any,
//             skillName: 'Angular',
//             proficiencyLevel: 'Advanced'
//           }
//         ],
//         educations: [
//           {
//             id: 'edu-001',
//             candidate: {} as any,
//             institution: 'University of Rabat',
//             degree: 'Bachelor in CS',
//             startDate: '2015-09-01',
//             endDate: '2019-06-30',
//             diploma: 'BSc Diploma'
//           }
//         ],
//         languages: [
//           {
//             id: 'lang-001',
//             candidate: {} as any,
//             description: 'Français courant',
//             englishDescription: 'Fluent French',
//             fullDescription: 'Langue maternelle',
//             language: 'Français',
//             languageInEnglish: 'French',
//             level: 'Advanced',
//             isNative: true
//           }
//         ],
//         address: {
//           id: 'addr-001',
//           street: '123 Rue Centrale',
//           postalCode: '10000',
//           fullAddress: '123 Rue Centrale, Rabat, Morocco',
//           city: {
//             id: 'city-001',
//             name: 'Rabat',
//             country: {
//               id: 'country-001',
//               name: 'Maroc',
//               englishName: 'Morocco',
//               cities: []
//             }
//           },
//           country: {
//             id: 'country-001',
//             name: 'Maroc',
//             englishName: 'Morocco',
//             cities: []
//           },
//           candidate: {} as any
//         }
//       }
//     }
//   ];

//   ngOnInit() {
//     const c = this.interviews[0].candidate;
//     c.contacts.forEach(x => (x.candidate = c));
//     c.experiences.forEach(x => (x.candidate = c));
//     c.skills.forEach(x => (x.candidate = c));
//     c.educations.forEach(x => (x.candidate = c));
//     c.languages.forEach(x => (x.candidate = c));
//     c.address.candidate = c;
//   }

//   getRemainingHours(expiryDate: Date): number {
//     const now = new Date();
//     const diff = expiryDate.getTime() - now.getTime();
//     return Math.max(Math.floor(diff / (1000 * 60 * 60)), 0);
//   }

//   isLinkActive(expiryDate: Date): boolean {
//     return this.getRemainingHours(expiryDate) > 0;
//   }
// }



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
