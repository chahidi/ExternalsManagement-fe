import { Contact } from './contact';
import { Experience } from './experience';
import { Skill } from './skill';
import { Education } from './education';
import { Address } from './address';
import { Language } from './language';
import { Evaluation } from './evaluation';

export interface PassedCandidate {
  id: string;
  fullName: string;
  address : Address;
  evaluations: Evaluation[];
}
