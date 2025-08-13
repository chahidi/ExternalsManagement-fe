import { Evaluation } from './evaluation';

export interface InterviewEvaluationDisplay {
  interviewId: string;
  candidateFullName: string;
  offerTitle: string;
  scheduledAt: string;       
  estimatedDuration: number;
  evaluations: Evaluation[];
}
