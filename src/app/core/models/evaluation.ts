// export interface Evaluation {
//   id: string;
//   type: 'Overall' | 'Technical' | 'Communication' | 'ProblemSolving';
//   score: number;
//   remarks?: string;
// }

export interface Evaluation {
  id: string;
  interviewId: number;
  score: number;
  description: string;
  type: string;
}
