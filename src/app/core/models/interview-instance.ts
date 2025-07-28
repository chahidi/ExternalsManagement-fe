import { Candidate } from './candidate';
import { Offer } from './offer';
import { Question } from './question';
import { Evaluation } from './evaluation';
import { Record } from './record';

export interface InterviewInstance {
  id: string;
  link: string;
  scheduledAt: Date;
  startTime: Date;
  endTime: Date;
  description: string;
  feedbackGeneral: string;
  comment: string;
  candidate: Candidate;
  offer: Offer;
  questions: Question[];
  evaluations: Evaluation[];
  record: Record;
}
