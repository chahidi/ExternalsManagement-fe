// src/app/core/models/interview-record.ts
export interface InterviewRecord {
    id: number;
    interviewId: number;
    recordedAt: Date;
    durationInSeconds: number;
    fileName: string;
    fileUrl: string;
    uploaded: boolean;
  }
