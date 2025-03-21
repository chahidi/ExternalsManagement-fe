import { Candidate } from './candidate';

export interface Skill {
  id: string; 
  candidate: Candidate; 
  skillName: string;
  proficiencyLevel: string; 
}
