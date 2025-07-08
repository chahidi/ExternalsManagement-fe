import { Question } from "./question"

export interface Response {
    id : string
    description : string 
    question  : Question
    createdAt? : Date
    isCorrect? :boolean
    score? : Float64ArrayConstructor
    
    attachements? : string[]
}