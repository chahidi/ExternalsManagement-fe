import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { OfferService } from '../../../../core/services/offer.service';
import { Offer } from '../../../../core/models/offer';
import { Interview } from '../../../../core/models/interview';
import { Question } from '../../../../core/models/question';
import { Response } from '../../../../core/models/response';
import { DividerModule } from 'primeng/divider';
import { TagModule }       from 'primeng/tag';
import { ChipModule }      from 'primeng/chip';
import { BadgeModule }     from 'primeng/badge';  
@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    CardModule,
    ButtonModule,
    AccordionModule,
    TableModule,
    RouterModule,
    DividerModule,
    TagModule,
    ChipModule,
    BadgeModule
  ],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss']
})
export class OfferDetailComponent {
  offer: Offer | undefined;
  interviews: Interview[] = [];
  questions: { [interviewId: string]: Question[] } = {};
  responses: { [questionId: string]: Response[] } = {};

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.offer = this.offerService.getOfferById(id);
      this.interviews = this.offerService.getInterviewsByOfferId(id);
      this.interviews.forEach(interview => {
        this.questions[interview.id] = this.offerService.getQuestionsByInterviewId(interview.id);
        this.questions[interview.id].forEach(question => {
          this.responses[question.id] = this.offerService.getResponsesByQuestionId(question.id);
        });
      });
    }
  }
}