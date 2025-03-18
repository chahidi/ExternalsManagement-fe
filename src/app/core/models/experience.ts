import { Candidate } from './candidate';

export interface Experience {
  id: string; 
  candidate: Candidate; 
  companyName: string;
  position: string;
  startDate: string; 
  endDate: string; 
  description: string;
}
