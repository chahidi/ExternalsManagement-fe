import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewClotureComponent } from './interview-cloture.component';

describe('InterviewClotureComponent', () => {
  let component: InterviewClotureComponent;
  let fixture: ComponentFixture<InterviewClotureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewClotureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewClotureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
