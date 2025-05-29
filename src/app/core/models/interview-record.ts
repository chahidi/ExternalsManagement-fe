// src/app/core/models/interview-record.ts
export interface InterviewRecord {
    id: number;                       // Optional: DB ID or timestamp
    interviewId: number;             // Associated interview session
    recordedAt: Date;                // When recording started
    durationInSeconds: number;      // Recording duration
    fileName: string;               // Saved file name
    fileUrl: string;                // Download or preview link
    uploaded: boolean;              // Has it been uploaded to server/storage
  }
