import { EvaluationType } from './evaluation-type';
import { InterviewInstance } from './interview-instance';

export interface Evaluation {
    id: string;
    score: number;
    feedback: string;
    interviewId: string;
    evaluationType: EvaluationType;
}
