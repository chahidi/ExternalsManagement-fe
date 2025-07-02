import { ProfileRequirements } from './profile-requirements';

export interface Offer {
    id: string;
    title: string;
    description: string;
    requirements: ProfileRequirements;
}
