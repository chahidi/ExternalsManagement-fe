import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewResultComponent } from './interview-evaluation.component';

describe('InterviewResultComponent', () => {
  let component: InterviewResultComponent;
  let fixture: ComponentFixture<InterviewResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
