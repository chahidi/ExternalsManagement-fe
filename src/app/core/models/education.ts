import { Candidate } from './candidate';

export interface Education {
  id: string; 
  candidate: Candidate; 
  institution: string;
  degree: string;
  startDate: string;
  endDate: string; 
  diploma: string;
}
