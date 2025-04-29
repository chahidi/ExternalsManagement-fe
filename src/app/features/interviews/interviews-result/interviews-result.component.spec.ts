import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewsResultComponent } from './interviews-result.component';

describe('InterviewsResultComponent', () => {
  let component: InterviewsResultComponent;
  let fixture: ComponentFixture<InterviewsResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewsResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewsResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
