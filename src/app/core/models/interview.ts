import { Candidate } from "./candidate"
import { Offer } from "./offer"

export interface Interview {
    id : string ;
    offer  : Offer;
    candidate : Candidate;
    sheduledDate : string;
    status :string;
}