import { Question } from './question';
import { Evaluation } from './evaluation';
import { Record } from './record';

export interface CreateInterview {
    scheduledAt: Date;
    description: string;
    feedbackGeneral: string;
    comment: string;
    estimatedDuration: number;
    candidateId: string;
    offerId: string;
    numberOfQuestions: number;
}
