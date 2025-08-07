import { Question } from './question';

export interface Answer {
  id: string;
  description: string;
  durationInMinutes: number|undefined;
  question?: Question;
}
