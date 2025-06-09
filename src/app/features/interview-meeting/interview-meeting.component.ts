import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService } from '../../core/services/record.service';
import { InterviewRecord } from '../../core/models/record';

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
  interviewStartTime: number = 0;
  interviewRecord!: InterviewRecord;

  // Subtitles
  showSubtitles: boolean = false;
  liveSubtitle: string = '';
  recognition!: any;

  constructor(private recordService: RecordService) {}

  async prepareInterview() {
    this.previewMode = true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      video.muted = true;
      video.volume = 0;
      await video.play();
    } catch {
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
      video.muted = true;
      video.volume = 0;
      await video.play();

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.interviewStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) this.recordedChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const duration = Math.floor((Date.now() - this.interviewStartTime) / 1000);
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordedBlobUrl = URL.createObjectURL(blob);

        this.interviewRecord = {
          id: Date.now(),
          interviewId: 1,
          recordedAt: new Date(),
          durationInSeconds: duration,
          fileName: `interview-${Date.now()}.webm`,
          fileUrl: this.recordedBlobUrl,
          uploaded: false,
        };

        this.recordService.saveRecord(this.interviewRecord).subscribe({
          next: () => {
            console.log('✅ Record saved to Mockoon.');
            this.finalizeRecording();
          },
          error: (err) => {
            console.error('❌ Failed to save record:', err);
            this.finalizeRecording();
          }
        });
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

    this.stopTranscription();

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();

      setTimeout(() => {
        if (this.interviewFinalizing && !this.interviewCompleted) {
          this.finalizeRecording();
        }
      }, 5000);
    } else {
      this.finalizeRecording();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    window.removeEventListener('beforeunload', this.preventUnload);
    document.removeEventListener('visibilitychange', this.handleTabSwitch);
    window.removeEventListener('resize', this.handleResize);
  }

  finalizeRecording() {
    this.interviewFinalizing = false;
    this.interviewCompleted = true;
    window.scrollTo(0, 0);
  }

  toggleSubtitles() {
    this.showSubtitles = !this.showSubtitles;

    if (this.showSubtitles) {
      this.startTranscription();
    } else {
      this.stopTranscription();
    }
  }

  startTranscription() {
    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechAPI) {
      this.warningMessage = '❌ Speech recognition not supported in this browser.';
      console.warn('❌ SpeechRecognition API not supported.');
      return;
    }

    console.log('🎤 Starting speech recognition...');
    this.recognition = new SpeechAPI();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;

    this.recognition.onstart = () => {
      console.log('✅ Speech recognition started.');
    };

    this.recognition.onresult = (event: any) => {
      console.log('📥 Raw results:', event.results);
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      console.log('📝 Final transcript:', transcript);
      this.liveSubtitle = transcript;
    };

    this.recognition.onerror = (event: any) => {
      console.error('🚨 Speech recognition error:', event.error);
      this.warningMessage = '⚠️ Speech recognition error: ' + event.error;
    };

    this.recognition.onend = () => {
      console.warn('🛑 Speech recognition stopped.');
    };

    this.recognition.start();
  }

  stopTranscription() {
    if (this.recognition) {
      console.log('🛑 Stopping speech recognition...');
      this.recognition.stop();
    }
    this.liveSubtitle = '';
  }

  private preventUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = '';
  }

  private handleTabSwitch = () => {
    if (document.visibilityState === 'hidden') {
      this.warningMessage = '🚫 Tab switch detected. You have been disqualified.';
    }
  }

  private handleResize = () => {
    if (this.preventResizeOnce) return;
    this.warningMessage = '⚠️ Resizing is not allowed during the interview.';
  }

  closeWarning() {
    this.warningMessage = null;
  }
}
