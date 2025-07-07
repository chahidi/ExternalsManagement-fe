import { InterviewInstance } from './interview-instance';
export interface Evaluation {
  id: string;
  interview: InterviewInstance;
  score: number;
  description: string;
}
