import { Interview } from "./interview"
import { Answer } from './answer';

export interface Question{
    id : string
    description : string
    interview : Interview
    type?: string
    points? :number
    questionOrder? : number
    createdAt? : Date
    tags? : string[]
    answer?: Answer
    durationInMinutes: number;
}


