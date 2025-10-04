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
    comment: string;
    candidateFullName: string;
    candidateMainTech: string;
    offerTitle: string;
    questions: Question[];
    evaluations: Evaluation[];
    record: Record;
}
