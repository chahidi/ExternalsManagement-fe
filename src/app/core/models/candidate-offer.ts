import { Address } from './address';
import { Contact } from './contact';
import { Education } from './education';
import { Experience } from './experience';
import { Language } from './language';
import { Skill } from './skill';

export interface CandidateOffer {
    id: string;
    fullName: string;
    mainTech: string;
    yearsOfExperience: number;
    skills: Skill[];
    languages: Language[];
    educations: Education[];
    contacts: Contact[];
    experiences: Experience[];
    address: Address;
}
