import { Candidate } from './candidate';

export interface Language {
  id: string; 
  candidate: Candidate; 
  description: string; 
  englishDescription: string; 
  fullDescription: string;
  language: string; 
  languageInEnglish: string; 
  level: string;
  isNative: boolean; 
}
