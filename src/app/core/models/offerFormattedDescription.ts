import { OfferFormattedDescriptionLanguage } from "./offerFormattedDescriptionLanguage";

export interface OfferFormattedDescription {
    description: string;
    mainTech: string;
    skills: string,
    languages: OfferFormattedDescriptionLanguage[];
    yearsOfExperience: number;
    mainResponsibilities: string;
    education: string;
    keywords: string
}