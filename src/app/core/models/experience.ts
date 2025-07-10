import { Candidate } from './candidate';

export interface Experience {
  id: string;
  candidateId: Candidate | string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string|null;
  description: string;
}
