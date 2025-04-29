import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewsHomeComponent } from './interviews-home.component';

describe('InterviewsHomeComponent', () => {
  let component: InterviewsHomeComponent;
  let fixture: ComponentFixture<InterviewsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewsHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
