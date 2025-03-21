import { Candidate } from './candidate';

export interface Contact {
  id: string;
  candidate: Candidate; 
  contactType: string;
  contactValue: string;
}
