export interface UploadChunkRequest{
    interviewId: string;
    chunk: Blob;
    sequence: number;
}