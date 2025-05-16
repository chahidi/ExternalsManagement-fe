import { Candidate } from "./candidate";

export interface Contact {
  id: string;
  contactType: string;
  contactValue: string;
  candidateId: Candidate | string;

}
