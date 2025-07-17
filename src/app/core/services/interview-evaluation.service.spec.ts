import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InterviewEvaluationService } from './interview-evaluation.service';
import { Evaluation } from '../models/evaluation';
import { Question } from '../models/question';
import { environment } from '../../../environments/environment';
import { InterviewInstance } from '../models/interview-instance';

describe('InterviewEvaluationService', () => {
    let service: InterviewEvaluationService;
    let httpMock: HttpTestingController;

    const interviewAlice: InterviewInstance = {
        id: '1abc',
        comment: 'Excellent React skills.',
        link:'',
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

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [InterviewEvaluationService]
        });

        service = TestBed.inject(InterviewEvaluationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should evaluate interview and return Evaluation object', () => {
        const mockQuestions: Question[] = [
            {
                id: 'q1',
                text: 'Explain virtual DOM in React.',
                timeLimit: 300,
                answer: 'It’s a lightweight copy of the actual DOM...',
                interview: interviewAlice
            },
            {
                id: 'q2',
                text: 'What are React hooks?',
                timeLimit: 300,
                answer: 'Hooks are functions that let you use state and lifecycle features in functional components.',
                interview: interviewAlice
            },
            {
                id: 'q3',
                text: 'How does useEffect differ from componentDidMount?',
                timeLimit: 300,
                answer: 'useEffect runs after render and can run on every update depending on its dependency array.',
                interview: interviewAlice
            }
        ];

        const mockResponse: Evaluation = {
            id: 'eval1',
            score: 84,
            description: 'Strong communication and problem-solving skills.',
            interview: interviewAlice
        };

        service.getInterviewEvaluation('Evaluate this candidate').subscribe((response) => {
            expect(response).toEqual(mockResponse);
            expect(response.score).toBe(84);
        });

        const req = httpMock.expectOne(`${environment.apiInterviews}/v1/interviews/evaluation`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            prompt: 'Evaluate this candidate',
            questions: mockQuestions
        });

        req.flush(mockResponse);
    });
});
