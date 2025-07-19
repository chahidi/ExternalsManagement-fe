import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterviewEvaluationComponent } from './interview-evaluation.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InterviewEvaluationService } from '../../../../core/services/interview-evaluation.service';
import { InterviewInstance } from '../../../../core/models/interview-instance';

describe('InterviewEvaluationComponent', () => {
  let component: InterviewEvaluationComponent;
  let fixture: ComponentFixture<InterviewEvaluationComponent>;

  const mockInterview: InterviewInstance = {
    id: '1abc',
    comment: 'Excellent React skills.',
    link: '',
    scheduledAt: new Date('2025-06-01T09:00:00Z'),
    startDate: new Date('2025-06-01T09:10:00Z'),
    endDate: new Date('2025-06-01T11:00:00Z'),
    candidate: {
      id: '101',
      fullName: 'Alice Johnson',
      birthDate: '1990-03-21',
      yearsOfExperience: 5,
      gender: 'Female',
      mainTech: 'React',
      summary: 'Experienced frontend developer with a focus on React and UI performance.',
      contacts: [],
      experiences: [],
      skills: [],
      educations: [],
      addresses: [],
      naturalLanguages: []
    },
    offer: {
      id: '201',
      title: 'Frontend Developer',
      description: 'Build and maintain frontend applications using React.'
    },
    record: {
      id: 'r1',
      interviewId: 1,
      recordedAt: new Date('2025-06-01T09:00:00Z'),
      durationInSeconds: 3600,
      fileName: 'alice_interview.mp4',
      fileUrl: '/videos/alice.mp4',
      uploaded: true,
      transcriptionFileUrl: '/transcripts/alice.txt'
    },
    questions: [],
    evaluation: {
      id: 'eval1',
      interview: null as any,
      score: 0,
      description: ''
    }
  };


  const mockEvaluation = {
    id: 'eval1',
    score: 85,
    description: 'Great skills',
    interview: mockInterview
  };

  const mockEvaluationService = {
    getInterviewEvaluation: jasmine.createSpy('getInterviewEvaluation').and.returnValue(of(mockEvaluation))
  };

  beforeEach(async () => {
    spyOnProperty(history, 'state', 'get').and.returnValue({ interview: mockInterview });

    await TestBed.configureTestingModule({
      imports: [InterviewEvaluationComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => mockInterview.id
              }
            }
          }
        },
        {
          provide: InterviewEvaluationService,
          useValue: mockEvaluationService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.interview).toEqual(mockInterview);
    expect(component.evaluation).toEqual(mockEvaluation);
    expect(component.finalScore).toBe(85);
  });
});
