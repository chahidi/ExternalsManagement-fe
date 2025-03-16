export interface Candidate {
    candidateId: number;
  
    /******* personnal information  *************/
    birthDate: Date | string;
    cin: string;
    firstName: string;
    lastName: string
}