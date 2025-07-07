import { Interview } from "./interview"

export interface Question{
    id : string 
    description : string 
    interview : Interview
    type?: string 
    order? : number 
    tags? : string[]
}