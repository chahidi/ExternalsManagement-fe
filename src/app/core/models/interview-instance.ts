import { Candidate } from './candidate';
import { Offer } from './offer';
import { Question } from './question';
import { Evaluation } from './evaluation';
import { Record } from './record';

export interface InterviewInstance {
    id: number;
    questions: Question[];
    candidate: Candidate;
    offer: Offer;
    evaluation: Evaluation;
    comment: string;
    scheduledAt: Date;
    startDate: Date;
    endDate: Date | null;
    record: Record;
}
