import { Candidate } from './candidate'; 

export interface InterviewInstance {
  id: number;
  candidate: Candidate;
  mainTech: string;
  started_at: string;
  submitted_at: string | null;
  status: 'passed' | 'notYet';
  expires_at: string;
  token: string;
}
