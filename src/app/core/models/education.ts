import { Candidate } from './Candidate';

export interface Education {
  id: string; 
  candidate: Candidate; 
  institution: string;
  degree: string;
  startDate: string;
  endDate: string; 
  diploma: string;
}
