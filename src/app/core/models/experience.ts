import { Candidate } from "./candidate";
export interface Experience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string|null;
  description: string;
  candidateId: Candidate | string;

}
