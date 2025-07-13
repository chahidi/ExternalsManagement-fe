import { Interview } from "./interview"

export interface Question{
    id : string 
    description : string 
    interview : Interview
    type?: string
    points? :number 
    questionOrder? : number 
    createdAt? : Date
    tags? : string[]
}