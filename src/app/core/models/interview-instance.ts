import { Candidate } from './candidate';
import { Offer } from './offer';
import { Link } from './link';
import { Question } from './question';
import { Answer } from './answer';
import { Evaluation } from './evaluation';
import { Record } from './record';


export interface InterviewInstance {
  id: number;
  candidate: Candidate;
  offer: Offer;
  interviewLink: Link;
  mainTech: string;
  startedAt: Date;
  submittedAt: Date | null;
  isPassed: boolean;
  overallScore: number;
  comment: string;
  questions: Question[];
  answers: Answer[];
  evaluations: Evaluation[];
  record: Record;
}
