import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OfferService } from '../../../../core/services/offer.service';
import { Offer } from '../../../../core/models/offer';
import { Interview } from '../../../../core/models/interview';
import { Question } from '../../../../core/models/question';
import { Response } from '../../../../core/models/response';
import { NgFor, NgIf } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    CardModule,
    ButtonModule,
    AccordionModule,
    TableModule,
    DividerModule,
    TagModule,
    ChipModule,
    BadgeModule,
    RouterModule
  ]
})
export class OfferDetailComponent implements OnInit {
  offer: Offer | undefined;
  interviews: Interview[] = [];
  questions: { [interviewId: string]: Question[] } = {};
  responses: { [questionId: string]: Response[] } = {};
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.offerService.isDataLoaded().pipe(
        switchMap(loaded => {
          if (!loaded) {
            return throwError(() => new Error('Data not loaded yet'));
          }
          return this.offerService.getOfferById(id);
        })
      ).subscribe({
        next: offer => {
          this.offer = offer;
          this.loadFakerData(offer.id);
        },
        error: err => {
          console.error('Error loading offer:', err);
          this.error = err.message || 'Failed to load offer details. Please try again later.';
        }
      });
    } else {
      this.error = 'Invalid offer ID.';
    }
  }

  private loadFakerData(offerId: string): void {
    this.interviews = this.offerService.getInterviewsByOfferId(offerId);
    if (this.interviews.length === 0) {
      this.error = 'No interviews generated for this offer. Please ensure candidates are available.';
    }
    this.interviews.forEach(interview => {
      this.questions[interview.id] = this.offerService.getQuestionsByInterviewId(interview.id);
      this.questions[interview.id].forEach(question => {
        this.responses[question.id] = this.offerService.getResponsesByQuestionId(question.id);
      });
    });
    console.log('Loaded interviews:', this.interviews);
    console.log('Loaded questions:', this.questions);
    console.log('Loaded responses:', this.responses);
  }
}