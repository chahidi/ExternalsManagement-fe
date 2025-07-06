
export interface Offer {
    id  : string ;
    titre  : string ;
    description : string ;
    salary?: number;
    createdAt?: string;
    status?: 'open' | 'closed';
    type?: 'Full-time' | 'Part-time' | 'Contract' | 'internship';
    department?: string;
}