import { Candidate } from "./candidate";

export interface Language {
  id: string;
  description: string;
  englishDescription: string;
  fullDescription: string;
  language: string;
  languageInEnglish: string;
  level: string;
  isNative: boolean;
  candidate ?: Candidate;
}
