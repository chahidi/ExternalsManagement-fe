import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interview-meeting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-meeting.component.html',
  styleUrls: ['./interview-meeting.component.scss']
})
export class InterviewMeetingComponent {
  interviewInProgress = false;
  warningMessage: string | null = null;
  private preventResizeOnce = false;

  startInterview(): void {
    this.interviewInProgress = true;

    document.addEventListener('visibilitychange', this.handleTabSwitch);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('beforeunload', this.preventUnload);

    document.documentElement.requestFullscreen?.();

    this.preventResizeOnce = true;
    setTimeout(() => (this.preventResizeOnce = false), 1000);
  }

  finishInterview(): void {
    this.interviewInProgress = false;

    document.removeEventListener('visibilitychange', this.handleTabSwitch);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('beforeunload', this.preventUnload);

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  showWarning(message: string): void {
    this.warningMessage = message;

    setTimeout(() => {
      this.warningMessage = null;
    }, 5000);
  }

  closeWarning(): void {
    this.warningMessage = null;
  }

  private preventUnload = (event: BeforeUnloadEvent) => {
    if (this.interviewInProgress) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  private handleTabSwitch = () => {
    if (document.hidden && this.interviewInProgress) {
      this.showWarning('Tab switching is not allowed during the interview.');
    }
  };

  private handleResize = () => {
    if (this.preventResizeOnce) return;

    if (this.interviewInProgress) {
      this.showWarning('Resizing the window is not allowed during the interview.');
    }
  };
}
