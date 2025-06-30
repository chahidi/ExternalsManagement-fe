export interface GenerateInterviewPayload {
  candidateId: string;
  offerId: string;
  interviewId: number;
  scheduledDate: Date;
}

export interface GenerateInterviewResponse {
  newLink: string;
  scheduledDate: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
