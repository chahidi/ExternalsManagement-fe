import { Contact } from './contact';
import { Experience } from './experience';
import { Skill } from './skill';
import { Education } from './education';
import { Address } from './address';
import { Language } from './language';

export interface Candidate {
  id: string; 
  fullName: string;
  birthDate: string; 
  yearsOfExperience: number;
  gender: string; 
  mainTech: string;
  summary: string;
  contacts: Contact[];
  experiences: Experience[];
  skills: Skill[];
  educations: Education[];
  address: Address;
  languages: Language[];
}
