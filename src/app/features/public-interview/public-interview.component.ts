import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-interview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-interview.component.html',
  styleUrls: ['./public-interview.component.scss']
})
export class PublicInterviewComponent {
  interviewStarted = false;
  private ignoreNextResize = false;

  startInterview(): void {
    this.interviewStarted = true;

    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }

    this.ignoreNextResize = true;
    setTimeout(() => {
      this.ignoreNextResize = false;
    }, 1000);

    window.addEventListener('beforeunload', this.preventUnload);
    document.addEventListener('visibilitychange', this.preventVisibilityChange);
    window.addEventListener('resize', this.preventResize);
  }

  finishInterview(): void {
    this.interviewStarted = false;

    window.removeEventListener('beforeunload', this.preventUnload);
    document.removeEventListener('visibilitychange', this.preventVisibilityChange);
    window.removeEventListener('resize', this.preventResize);

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    alert('Interview finished! You may now close the window.');
  }

  private preventUnload = (event: BeforeUnloadEvent): string => {
    event.preventDefault();
    event.returnValue = '';
    return '';
  };

  private preventVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      alert('⚠️ Switching tabs is not allowed during the interview!');
    }
  };

  private preventResize = (): void => {
    if (this.ignoreNextResize) return;
    alert('⚠️ Resizing the window is not allowed during the interview!');
  };
}


//   {
//     "candidateId": 101,
//     "token": "abc123xyz",
//     "interviewLink": "http://localhost:4200/interview/abc123xyz"
//   }
