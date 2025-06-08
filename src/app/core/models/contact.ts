import { Candidate } from './candidate';

export interface Contact {
  id: string;
  candidateId: Candidate | string ;
  contactType: string;
  contactValue: string;
}
