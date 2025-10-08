import { Question } from './question';
import { Evaluation } from './evaluation';

export interface CreateInterview {
    scheduledAt: Date;
    description: string;
    comment: string;
    estimatedDuration: number;
    candidateId: string;
    offerId: string;
    numberOfQuestions: number;
}
