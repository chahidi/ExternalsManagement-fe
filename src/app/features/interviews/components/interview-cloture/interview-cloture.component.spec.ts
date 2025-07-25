import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterviewClotureComponent } from './interview-cloture.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('InterviewClotureComponent', () => {
  let component: InterviewClotureComponent;
  let fixture: ComponentFixture<InterviewClotureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewClotureComponent],
      providers:[provideNoopAnimations()]
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
