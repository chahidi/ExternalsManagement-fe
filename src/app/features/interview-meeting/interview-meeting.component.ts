import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interview-meeting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-meeting.component.html',
})
export class InterviewMeetingComponent {
  interviewInProgress = false;
  previewMode = false;
  warningMessage: string | null = null;
  stream: MediaStream | null = null;
  private preventResizeOnce = false;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

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
    this.interviewInProgress = true;
    this.previewMode = false;

    const docEl = document.documentElement;
    if (docEl.requestFullscreen) await docEl.requestFullscreen();

    if (this.stream) {
      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      await video.play();
    }

    this.preventResizeOnce = true;
    setTimeout(() => (this.preventResizeOnce = false), 1000);

    window.addEventListener('beforeunload', this.preventUnload);
    document.addEventListener('visibilitychange', this.handleTabSwitch);
    window.addEventListener('resize', this.handleResize);
  }

  finishInterview() {
    this.interviewInProgress = false;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (document.fullscreenElement) document.exitFullscreen();

    window.removeEventListener('beforeunload', this.preventUnload);
    document.removeEventListener('visibilitychange', this.handleTabSwitch);
    window.removeEventListener('resize', this.handleResize);

    alert('✅ Interview completed. You may now close this window.');
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
