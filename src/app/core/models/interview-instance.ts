import { Candidate } from './candidate';

export interface InterviewInstance {
  id: number;
  candidate: Candidate;
  interviewLink: string;
  mainTech: string;
  startedAt: Date;
  submittedAt: Date | null;
  isPassed: boolean;
  expiresAt: Date;
  token: string;
  linkGenerationCount?: number;
}
