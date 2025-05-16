import { Candidate } from './candidate';

export interface InterviewInstance {
  isPassed: boolean;
  comment: string;
  id: number;
  candidate: Candidate;
  interviewLink: string;
  mainTech: string;
  startedAt: Date;
  submittedAt: Date | null;
  expiresAt: Date;
  token: string;
  linkGenerationCount?: number;
}
