
export interface Offer {
    id  : string ;
    titre  : string ;
    description : string ;
    createdAt?: string;
    status?: 'open' | 'closed';
    type?: string;
    department?: string;
}