export interface GenerateInterviewLinkPayload {
  candidateId: string;
  offerId: string;
  interviewId: string;
  scheduledDate: Date;
}

export interface SendInterviewEmailPayload {
  candidateFullName: string;
  offerTitle: string;
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
