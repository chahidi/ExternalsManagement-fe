import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interview-meeting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-meeting.component.html',
})
export class InterviewMeetingComponent {
  interviewStarted = false;
  previewMode = false;
  interviewInProgress = false;
  interviewFinalizing = false;
  interviewCompleted = false;

  warningMessage: string | null = null;
  stream: MediaStream | null = null;
  private preventResizeOnce = false;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  recordedBlobUrl: string | null = null;

  async prepareInterview() {
    this.previewMode = true;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      await video.play();
    } catch (err) {
      this.warningMessage = 'Camera access denied. Please enable your camera and reload the page.';
      this.previewMode = false;
    }
  }

  async startInterview() {
    this.interviewStarted = true;
    this.previewMode = false;
    this.interviewInProgress = true;

    const docEl = document.documentElement;
    if (docEl.requestFullscreen) await docEl.requestFullscreen();

    if (this.stream) {
      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      await video.play();

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) this.recordedChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordedBlobUrl = URL.createObjectURL(blob);
        this.interviewFinalizing = false;
        this.interviewCompleted = true;
      };

      this.mediaRecorder.start();
    }

    this.preventResizeOnce = true;
    setTimeout(() => (this.preventResizeOnce = false), 1000);

    window.addEventListener('beforeunload', this.preventUnload);
    document.addEventListener('visibilitychange', this.handleTabSwitch);
    window.addEventListener('resize', this.handleResize);
  }


  finishInterview() {
    this.interviewInProgress = false;
    this.interviewFinalizing = true;

    // Stop recording first
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();

      // Add a fallback: if nothing happens after 5s, finalize anyway
      setTimeout(() => {
        if (this.interviewFinalizing && !this.interviewCompleted) {
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
          this.recordedBlobUrl = URL.createObjectURL(blob);
          this.interviewFinalizing = false;
          this.interviewCompleted = true;
          console.warn('⚠️ Fallback triggered: Finalizing manually due to no onstop');
        }
      }, 5000);
    } else {
      // No recorder available, finalize immediately (edge case)
      this.interviewFinalizing = false;
      this.interviewCompleted = true;
    }

    // Stop camera
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Clean up events
    window.removeEventListener('beforeunload', this.preventUnload);
    document.removeEventListener('visibilitychange', this.handleTabSwitch);
    window.removeEventListener('resize', this.handleResize);
  }


  private preventUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = '';
  };

  private handleTabSwitch = () => {
    if (document.visibilityState === 'hidden') {
      this.warningMessage = '🚫 Tab switch detected. You have been disqualified.';
    }
  };

  private handleResize = () => {
    if (this.preventResizeOnce) return;
    this.warningMessage = '⚠️ Resizing the window is not allowed during the interview.';
  };

  closeWarning() {
    this.warningMessage = null;
  }
}
