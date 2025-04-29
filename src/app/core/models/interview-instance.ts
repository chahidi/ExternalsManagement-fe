import { Candidate } from './candidate';

export interface InterviewInstance {
  id: number;
  candidate: Candidate;
  mainTech: string;
  startedAt: Date;
  submittedAt: Date | null;
  isPassed: boolean;
  expiresAt: Date;
  token: string;
}
