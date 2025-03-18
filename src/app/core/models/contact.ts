import { Candidate } from './Candidate';

export interface Contact {
  id: string;
  candidate: Candidate; 
  contactType: string;
  contactValue: string;
}
