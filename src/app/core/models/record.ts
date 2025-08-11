export interface Record {
    id: string;
    interviewId: number;
    recordedAt: Date;
    durationInSeconds: number;
    fileName: string;
    fileUrl: string;
    uploaded: boolean;
    transcriptionFileUrl: string;
}
