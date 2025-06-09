export interface Question {
  id: string;
  text: string;
  type: 'Personal' | 'Technical' | 'ProblemSolving';
  level: 'Easy' | 'Medium' | 'Hard';
  timeLimitSeconds: number;
}
