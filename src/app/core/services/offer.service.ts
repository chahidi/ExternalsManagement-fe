import { Injectable } from '@angular/core';
import { Offer } from '../models/offer';
import { Interview } from '../models/interview';
import { Candidate } from '../models/candidate';
import { CandidateService } from './candidate.service';
import { faker } from '@faker-js/faker';
import { Question } from '../models/question';
import { Response } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private offers: Offer[] = [];
  private interviews: Interview[] = [];
  private questions: Question[] = [];
  private responses: Response[] = [];

  constructor(private candidateService: CandidateService) {
    this.candidateService.getCandidates().subscribe(candidates => {
      this.generateMockData(candidates);
    });
  }

  private generateMockData(candidates: Candidate[]): void {
    const departmentOptions = [
      'Data Analyst', 'Front End', 'Back End', 'Full Stack',
      'Tester', 'Java Developer', 'Angular Developer',
      'DevOps', 'Networking System', 'Database Administrator'
    ];

    for (let i = 0; i < 20; i++) {
      const date = faker.date.recent({ days: 30 });

      const offer: Offer = {
        id: faker.string.uuid(),
        titre: faker.name.jobTitle(),
        description: faker.lorem.paragraph(3),
        salary: faker.number.int({ min: 3000, max: 6000 }),
        createdAt: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`,
        status: faker.helpers.arrayElement(['open', 'closed']),
        type: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract', 'Internship']),
        department: faker.helpers.arrayElement(departmentOptions)
      };

      this.offers.push(offer);

      const numInterviews = faker.number.int({ min: 1, max: 2 }); // 1–2 interviews
      for (let j = 0; j < numInterviews; j++) {
        const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
        const interview: Interview = {
          id: faker.string.uuid(),
          offer: offer,
          candidate: randomCandidate,
          sheduledDate: faker.date.soon().toISOString(),
          status: faker.helpers.arrayElement(['scheduled', 'completed'])
        };
        this.interviews.push(interview);

        const numQuestions = faker.number.int({ min: 2, max: 3 }); // 2–3 questions
        for (let q = 0; q < numQuestions; q++) {
          const question: Question = {
            id: faker.string.uuid(),
            description: faker.lorem.sentence(3),
            interview: interview
          };
          this.questions.push(question);

          const numResponses = faker.number.int({ min: 1, max: 2 }); // 1–2 responses
          for (let r = 0; r < numResponses; r++) {
            this.responses.push({
              id: faker.string.uuid(),
              description: faker.lorem.sentence(3),
              question: question
            });
          }
        }
      }
    }
  }

  getOffers(): Offer[] {
    return this.offers;
  }

  addOffer(offer: Offer): void {
    this.offers.push({
      ...offer,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'open'
    });
  }

  updateOffer(offer: Offer): Offer | undefined {
    const index = this.offers.findIndex(o => o.id === offer.id);
    if (index > -1) {
      this.offers[index] = { ...offer };
      return this.offers[index];
    }
    return undefined;
  }

  deleteOffer(offerId: string): void {
    this.offers = this.offers.filter(o => o.id !== offerId);
  }

  getOfferById(id: string): Offer | undefined {
    return this.offers.find(o => o.id === id);
  }

  getInterviewsByOfferId(offerId: string): Interview[] {
    return this.interviews.filter(i => i.offer.id === offerId);
  }

  getQuestionsByInterviewId(interviewId: string): Question[] {
    return this.questions.filter(q => q.interview.id === interviewId);
  }

  getResponsesByQuestionId(questionId: string): Response[] {
    return this.responses.filter(r => r.question.id === questionId); // Fixed syntax error
  }
}