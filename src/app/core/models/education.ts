import { Candidate } from "./candidate";

export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  diploma: string;
  candidate?: Candidate;

}
