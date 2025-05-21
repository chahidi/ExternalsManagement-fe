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
  private preventResizeOnce = false;

  startInterview(): void {
    this.interviewInProgress = true;

    const interviewPage = document.documentElement;
    if (interviewPage.requestFullscreen) {
      interviewPage.requestFullscreen();
    }

    this.preventResizeOnce = true;
    setTimeout(() => {
      this.preventResizeOnce = false;
    }, 1000);

    window.addEventListener('beforeunload', this.preventUnload);
    document.addEventListener('visibilitychange', this.handleTabSwitch);
    window.addEventListener('resize', this.handleResize);
  }

  finishInterview(): void {
    this.interviewInProgress = false;

    window.removeEventListener('beforeunload', this.preventUnload);
    document.removeEventListener('visibilitychange', this.handleTabSwitch);
    window.removeEventListener('resize', this.handleResize);

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    alert('✅ Interview completed. You may now leave.');
  }

  private preventUnload = (event: BeforeUnloadEvent): string => {
    event.preventDefault();
    event.returnValue = '';
    return '';
  };

  private handleTabSwitch = (): void => {
    if (document.visibilityState === 'hidden') {
      alert('🚫 Switching tabs is prohibited during the interview!');
    }
  };

  private handleResize = (): void => {
    if (this.preventResizeOnce) return;
    alert('🚫 Window resizing is not allowed during the interview!');
  };
}
