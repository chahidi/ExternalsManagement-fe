export interface Evaluation {
  id: string;
  type: 'Overall' | 'Technical' | 'Communication' | 'ProblemSolving';
  score: number;
  remarks?: string;
}
