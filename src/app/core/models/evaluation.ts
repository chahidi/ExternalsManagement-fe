import { EvaluationType } from './evaluation-type';

export interface Evaluation {
  id: string;
  score: number;
  feedback: string;
  interviewId: string;
  evaluationType: EvaluationType;
}
