import { ProfileRequirements } from './profile-requirements';

export interface Offer {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requiredTechnicalSkills: string[];
  isRemote: boolean;
  isHybrid: boolean;
  requirements: ProfileRequirements;
}
