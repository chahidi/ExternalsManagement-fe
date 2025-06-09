export interface Offer {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requiredTechnicalSkills: string[];
  isRemote: boolean;
  isHybrid: boolean;
  requiredEducation: string;
  requiredYearsOfExperience: number;
  requiredLanguage: string;
  requiredCommunicationLevel: string;
  requiredProfileStrength: string;
}
