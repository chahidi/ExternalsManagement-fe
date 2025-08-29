import { InterviewInstance } from './interview-instance';
import { Answer } from './answer';

export interface Question {
  id: string;
  description: string;
  durationInMinutes: number;
  interviewId: string;
  answer?: Answer;
}
