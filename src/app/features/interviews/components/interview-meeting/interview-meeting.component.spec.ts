import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewMeetingComponent } from './interview-meeting.component';

describe('InterviewMeetingComponent', () => {
  let component: InterviewMeetingComponent;
  let fixture: ComponentFixture<InterviewMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewMeetingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
