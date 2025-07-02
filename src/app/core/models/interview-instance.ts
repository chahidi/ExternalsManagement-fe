import { Candidate } from './candidate';
import { Offer } from './offer';
import { Question } from './question';
import { Evaluation } from './evaluation';
import { Record } from './record';

export interface InterviewInstance {
    id: number;
    candidate: Candidate;
    offer: Offer;
    mainTech: string;
    startedAt: Date;
    submittedAt: Date | null;
    isPassed: boolean;
    overallScore: number;
    comment: string;
    questions: Question[];
    evaluations: Evaluation[];
    record: Record;
}
