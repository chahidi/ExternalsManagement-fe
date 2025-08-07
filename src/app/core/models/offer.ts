
export interface Offer {
    id  : string ;
    title  : string ;
    description : string ;
    createdAt?: string;
    status: 'open' | 'closed' | 'pending';
    type: string;
    department: string;
}
