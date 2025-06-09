import { Candidate } from './candidate';
import { Question } from './question';
import { Answer } from './answer';
import { Evaluation } from './evaluation';
import { Record } from './record';
import { Offer } from './offer';

export interface InterviewInstance {
    id: number;
    candidate: Candidate;
    offer: Offer;
    interviewLink: string;
    mainTech: string;
    startedAt: Date;
    submittedAt: Date | null;
    isPassed: boolean;
    expiresAt: Date;
    token: string;
    linkGenerationCount?: number;
    questions: Question[]; // 7
    answers: Answer[];
    evaluations: Evaluation[]; //4
    record: Record;
}
