
export interface Offer {
    id  : string ;
    titre  : string ;
    description : string ;
    salary: number;
    createdAt?: string;
    status?: 'open' | 'closed';
    type?: string;
    department?: string;
}