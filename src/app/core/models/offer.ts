
export interface Offer {
    id  : string ;
    titre  : string ;
    description : string ;
    createdAt?: string;
    status: 'open' | 'closed' | 'pending';
    type: string;
    skills? : string[];
    department: string;
}