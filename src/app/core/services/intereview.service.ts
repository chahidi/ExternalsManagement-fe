import { Injectable } from '@angular/core';
import { Interview } from '../models/interview';
import { faker } from '@faker-js/faker';
import { OfferService } from './offer.service';
import { CandidateService } from './candidate.service';
import { Candidate } from '../models/candidate';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private interviews: Interview[] = [];


  constructor(
    private offerService: OfferService,
    private candidateService: CandidateService
  ) {
    this.init();
  }

  private init() {
    // fetch candidates then generate interviews
    this.candidateService.getCandidates().subscribe(candidates => {
      this.generateMockInterviews(candidates);
    });
  }

  private generateMockInterviews(candidates: Candidate[]) {
    const offers = this.offerService.getOffers();

    for (let i = 0; i < 20; i++) {
      const randomOffer = offers[Math.floor(Math.random() * offers.length)];
    
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];

      this.interviews.push({
        id: faker.string.uuid(),
        offer: randomOffer,
        candidate: randomCandidate,
        sheduledDate: faker.date.soon().toISOString(),
        status: faker.helpers.arrayElement(['scheduled', 'completed'])
      });
    }
}

  getInterviewsByOfferId(offerId: string): Interview[] {
    return this.interviews.filter(i => i.offer.id === offerId);
  }
}
