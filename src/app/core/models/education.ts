import { Candidate } from "./candidate";

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  diploma: string;
  candidate?: Candidate;

}
