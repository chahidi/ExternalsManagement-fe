import { Candidate } from './candidate';

export interface InterviewInstance {

  id: number;
  candidate: Candidate;
  interviewLink: string;
  mainTech: string;
  startedAt: Date;
  submittedAt: Date | null;
  expiresAt: Date;
  token: string;
  isPassed: boolean;
  linkGenerationCount?: number;
  comment: string;
}
