import { InterviewInstance } from './interview-instance';
export interface Question {
    id: string;
    text: string;
    timeLimit: number;
    interview: InterviewInstance;
    answer: string;
}
