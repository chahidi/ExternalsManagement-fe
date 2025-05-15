import { Candidate } from './candidate';
export interface InterviewInstance {
  id: number;
  candidate: {
    fullName: string;
    contacts: {
      contactType: string;
      contactValue: string;
    }[];
  };
  interviewLink?: string;
  mainTech?: string;
  startedAt?: Date;
  expiresAt?: Date;
  token?: string;
  status?: string;
  comment?: string;
  linkGenerationCount?: number;
  isPassed?: boolean;
}
