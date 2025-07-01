export interface GenerateInterviewLinkPayload {
  candidateId: string;
  offerId: string;
  interviewId: number;
  scheduledDate: Date;
}

export interface GenerateInterviewLinkResponse {
  newLink: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
