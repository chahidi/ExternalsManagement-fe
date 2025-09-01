import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { INTERVIEW_RULES, InterviewRule } from '../../../../core/constants/interview-rules.const';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { Question } from '../../../../core/models/question';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { InterviewEvaluationService } from '../../../../core/services/interview-evaluation.service';
import { NotificationService } from '../../../../core/services/utils/notification.service';
import { SpeechRecognitionService } from '../../../../core/services/speech-recognition.service';
import { Answer } from '../../../../core/models/answer';
import { ActivatedRoute } from '@angular/router';
import { InterviewService } from '../../../../core/services/interview.service';
import { TokenValidationService } from '../../../../core/services/token-validation.service';
import { AnswerService, CreateAnswerRequest } from '../../../../core/services/answer.service';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Router } from '@angular/router';
import { cameraTransition, slideInInterview, fadeInControls, slideInTranscript } from '../../../../shared/layout/animations/interview-meeting.animations';
import { fadeIn } from '../../../../shared/layout/animations/common.animation';
import { QuestionsAndAnswersForEvaluationDTO } from '../../../../core/models/interview-evaluation';

type SpeechRecognitionState = {
    isListening: boolean;
    isSupported: boolean;
    error: string | null;
    finalTranscript: string;
    interimTranscript: string;
    combinedTranscript: string;
};

@Component({
    selector: 'app-interview-meeting',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        MessageModule,
        InputTextModule,
        PanelModule,
        ProgressSpinnerModule,
        ToastModule,
        DividerModule,
        TagModule,
        SkeletonModule,
        AvatarModule,
        ScrollPanelModule
    ],
    templateUrl: './interview-meeting.component.html',
    providers: [MessageService, NotificationService],
    animations: [cameraTransition, slideInInterview, fadeInControls, slideInTranscript, fadeIn]
})
export class InterviewMeetingComponent implements AfterViewInit, OnDestroy {
    // UI State
    interviewStarted = false;
    previewMode = false;
    isInterviewInProgress = false;
    isInterviewFinalizing = false;
    isInterviewCompleted = false;
    isTranscriptVisible = true;
    isCameraReady = false;
    isCameraEnabled = false;
    showRulesAndPreview = true;
    showSubmitButton = false;
    canSubmitAnswer = false;
    isWaitingForAnswer = false;
    aiSpeaking = false;
    showSubtitles = false;

    // User interaction
    currentUserAnswer: string = '';
    userWarningMessage: string | null = null;
    liveSubtitle = '';

    // Camera
    stream: MediaStream | null = null;
    private preventResizeOnce = false;

    // Speech Recognition
    speechRecognitionState: SpeechRecognitionState = {
        isListening: false,
        isSupported: false,
        error: null,
        finalTranscript: '',
        interimTranscript: '',
        combinedTranscript: ''
    };

    // View Children
    @ViewChild('previewVideo') previewVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild('interviewVideo') interviewVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild('transcriptScroll') scrollPanel!: any;

    // Interview Data
    questions: Question[] = [];
    currentQuestionIndex = 0;
    timeRemaining = 0;
    questionInterval: any;
    transcriptMessages: {
        sender: string;
        text: string;
        align: 'left' | 'right';
        type: 'question' | 'answer'
    }[] = [];
    currentTime: string = '';
    interviewRules: InterviewRule[] = INTERVIEW_RULES;
    interviewToken: any;
    interviewId: string = '';
    interviewStartTime = 0;
    questionStartTime = 0;

    // Observables
    private destroy$ = new Subject<void>();
    private eventListenersRegistered = false;

    constructor(
        private tts: TextToSpeechService,
        private evaluationService: InterviewEvaluationService,
        private notify: NotificationService,
        private speechRecognitionService: SpeechRecognitionService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private interviewService: InterviewService,
        private tokenValidationService: TokenValidationService,
        private answerService: AnswerService
    ) {}

    ngOnInit(): void {
        this.initializeComponent();
        this.subscribesToSpeechRecognition();
        this.subscribeToTTSState();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.requestCameraPermission();
        }, 500);
    }

    private initializeComponent(): void {
        this.activatedRoute.params.subscribe((params) => {
            const token = params['token'];
            if (token) {
                this.interviewToken = token;
                console.log('Extracted interview token:', token);
                this.loadInterviewFromToken(token);
            } else {
                console.error('No interview token found in route');
                this.notify.showError('Error', 'Invalid interview link.');
                this.router.navigate(['/']);
            }
        });

        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.checkSpeechRecognitionSupport();
        this.isCameraReady = true;
    }

    private subscribeToTTSState(): void {
        this.tts.isSpeaking$.pipe(takeUntil(this.destroy$)).subscribe(isSpeaking => {
            this.aiSpeaking = isSpeaking;
            this.cdr.detectChanges();
        });
    }

    private loadInterviewFromToken(token: string): void {
        this.tokenValidationService.getInterviewIdFromToken(token).subscribe({
            next: (interviewId) => {
                console.log('Retrieved interview ID:', interviewId);
                this.interviewId = interviewId;
                this.loadInterviewQuestions(interviewId);
            },
            error: (err) => {
                console.error('Failed to get interview ID from token:', err);
                this.notify.showError('Error', 'Failed to retrieve interview information.');
                this.router.navigate(['/token-error']);
            }
        });
    }

    private loadInterviewQuestions(interviewId: string): void {
        console.log('Loading questions for interview ID:', interviewId);
        this.interviewService.getInterviewQuestions(interviewId).subscribe({
            next: (questions) => {
                this.questions = questions;
                this.currentQuestionIndex = 0;
                console.log('Loaded interview questions:', questions);
                this.smartPreloadInitialQuestions();
            },
            error: (err) => {
                console.error('Failed to load interview questions:', err);
                this.notify.showError('Error', 'Failed to load interview questions. Please refresh the page.');
            }
        });
    }

    private smartPreloadInitialQuestions(): void {
        if (this.questions && this.questions.length > 0) {
            const questionTexts = this.questions.map(q => q.description);
            this.tts.smartPreload(questionTexts, 0);
            console.log('Smart preloading started for first 3 questions');
        }
    }

    private subscribesToSpeechRecognition(): void {
        this.speechRecognitionService.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
            this.speechRecognitionState = state;
            this.updateUIFromSpeechState(state);
            this.cdr.detectChanges();
        });

        this.speechRecognitionService.result$.pipe(takeUntil(this.destroy$)).subscribe((result) => {
            this.handleSpeechResult(result);
        });

        this.speechRecognitionService.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
            this.handleSpeechError(error?.message ?? String(error));
        });
    }

    private updateUIFromSpeechState(state: SpeechRecognitionState): void {
        this.liveSubtitle = state.combinedTranscript;
        this.currentUserAnswer = state.finalTranscript;
        this.canSubmitAnswer = state.finalTranscript.trim().length > 0;

        if (state.error) {
            this.userWarningMessage = state.error;
        }
    }

    private handleSpeechResult(result: any): void {
        if (!result.isFinal) {
            this.liveSubtitle = this.speechRecognitionService.getCombinedTranscript();
        }
        if (result.isFinal) {
            this.currentUserAnswer = this.speechRecognitionService.getFinalTranscript();
            this.canSubmitAnswer = this.currentUserAnswer.trim().length > 0;
        }

        this.cdr.detectChanges();
    }

    private handleSpeechError(error: string): void {
        console.error('Speech recognition error:', error);
        this.notify.showError('Speech Recognition Error', error);
        this.userWarningMessage = error;
    }

    checkSpeechRecognitionSupport(): void {
        if (!this.speechRecognitionService.isSupported()) {
            this.userWarningMessage = 'Speech recognition is not supported in your browser. Please use Chrome or Edge.';
            this.notify.showError('Browser Not Supported', 'Speech recognition requires Chrome or Edge browser.');
        }
    }

    updateClock(): void {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.currentTime = `${hours}:${minutes}`;
    }

    async requestCameraPermission(): Promise<void> {
        try {
            console.log('Requesting camera permission...');
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });

            console.log('Camera stream obtained:', this.stream);
            this.isCameraEnabled = true;
            this.previewMode = true;
            this.configureCameraPreview();
        } catch (error) {
            console.warn('Camera permission denied or failed:', error);
            this.handleCameraInitializationFailure();
        }
    }

    private configureCameraPreview(): void {
        setTimeout(() => {
            this.attachStreamToVideoElement(this.previewVideo?.nativeElement);
        }, 100);
    }

    private attachStreamToVideoElement(videoElement: HTMLVideoElement | undefined): void {
        if (videoElement && this.stream) {
            videoElement.srcObject = this.stream;
            videoElement.muted = true;
            videoElement.playsInline = true;
            videoElement.autoplay = true;
            videoElement.onloadedmetadata = () => {
                videoElement.play().catch((e) => console.error('Video play error:', e));
            };
        }
    }

    private handleCameraInitializationFailure(): void {
        this.isCameraEnabled = false;
        this.previewMode = false;
    }

    private configureInterviewVideo(): void {
        if (this.interviewVideo?.nativeElement && this.stream) {
            this.attachStreamToVideoElement(this.interviewVideo.nativeElement);
        }
    }

    async startInterview(): Promise<void> {
        console.log('Starting interview...');
        this.interviewStarted = true;
        this.showRulesAndPreview = false;
        this.isInterviewInProgress = true;
        this.previewMode = false;
        this.interviewStartTime = Date.now();

        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.warn('Could not enter fullscreen mode:', error);
        }

        if (this.isCameraEnabled) {
            setTimeout(() => {
                this.configureInterviewVideo();
            }, 100);
        }

        this.preventResizeOnce = true;
        setTimeout(() => (this.preventResizeOnce = false), 1000);

        this.attachEventListeners();
        this.startNextQuestion();
    }

    private attachEventListeners(): void {
        if (!this.eventListenersRegistered) {
            window.addEventListener('beforeunload', this.preventUnload);
            document.addEventListener('visibilitychange', this.handleTabSwitch);
            window.addEventListener('resize', this.handleResize);
            this.eventListenersRegistered = true;
        }
    }

    addCurrentQuestionToTranscript(): void {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (currentQuestion?.description) {
            this.transcriptMessages.push({
                sender: 'AI',
                text: currentQuestion.description,
                align: 'left',
                type: 'question'
            });
            this.cdr.detectChanges();
            this.scrollTranscriptToBottom();
        }
    }

    async startNextQuestion(): Promise<void> {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion || !this.isInterviewInProgress) return;

        this.resetSpeechRecognitionData();
        this.timeRemaining = currentQuestion.durationInMinutes * 60;
        this.questionStartTime = Date.now();
        this.aiSpeaking = true;
        this.hideSubmissionControls();

        this.addCurrentQuestionToTranscript();
        this.initializeQuestionTimer();
        this.preloadUpcomingQuestions();

        try {
            await this.tts.speak(currentQuestion.description, true);
            this.aiSpeaking = false;
            this.isWaitingForAnswer = true;
            this.showSubmitButton = true;
            console.log('AI finished speaking, starting recognition...');
            this.scheduleDelayedSpeechRecognition();
        } catch (error) {
            console.error('TTS error:', error);
            this.handleTTSError();
        }
    }

    private preloadUpcomingQuestions(): void {
        if (this.questions.length > 0) {
            const questionTexts = this.questions.map(q => q.description);
            this.tts.smartPreload(questionTexts, this.currentQuestionIndex);
            const stats = this.tts.getCacheStats();
            console.log(`Cache stats: ${stats.size} items cached`);
        }
    }

    private resetSpeechRecognitionData(): void {
        this.speechRecognitionService.reset();
        this.liveSubtitle = '';
        this.currentUserAnswer = '';
        console.log('Speech recognition data reset');
    }

    private scheduleDelayedSpeechRecognition(): void {
        setTimeout(() => {
            if (this.isInterviewInProgress && this.timeRemaining > 0) {
                this.resetSpeechRecognitionData();
                this.beginSpeechRecognition();
            }
        }, 1000);
    }

    private handleTTSError(): void {
        console.warn('TTS failed, continuing with silent mode');
        this.aiSpeaking = false;
        this.isWaitingForAnswer = true;
        this.showSubmitButton = true;
        this.scheduleDelayedSpeechRecognition();
    }

    private initializeQuestionTimer(): void {
        this.questionInterval = setInterval(() => {
            this.decrementTimeRemaining();
        }, 1000);
    }

    private decrementTimeRemaining(): void {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
            this.handleQuestionTimeExpired();
        }
    }

    private beginSpeechRecognition(): void {
        this.speechRecognitionService.start();
        console.log('Speech recognition started for question:', this.currentQuestionIndex + 1);
    }

    submitCurrentAnswer(): void {
        const userAnswerText = this.speechRecognitionService.getFinalTranscript().trim();
        if (!userAnswerText) {
            this.notify.showWarning('No Answer', 'Please provide an answer before submitting.');
            return;
        }

        this.stopSpeechRecognition();
        this.hideSubmissionControls();

        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion) {
            console.error('No current question found');
            this.proceedToNextQuestion();
            return;
        }

        const actualDurationMinutes = Math.ceil((Date.now() - this.questionStartTime) / (1000 * 60));

        const answerObject: Answer = {
            id: Date.now().toString(),
            description: userAnswerText,
            durationInMinutes: actualDurationMinutes
        };

        currentQuestion.answer = answerObject;

        this.transcriptMessages.push({
            sender: 'You',
            text: userAnswerText,
            align: 'right',
            type: 'answer'
        });

        this.cdr.detectChanges();
        this.scrollTranscriptToBottom();

        const answerData: CreateAnswerRequest = {
            questionId: currentQuestion.id,
            description: userAnswerText,
            durationInMinutes: actualDurationMinutes
        };

        this.answerService.createAnswer(answerData).subscribe({
            next: (response) => {
                console.log('Answer saved to backend:', response);
            },
            error: (error) => {
                console.error('Failed to save answer:', error);
            }
        });

        this.proceedToNextQuestion();
    }

    private proceedToNextQuestion(): void {
        this.stopSpeechRecognition();
        this.clearQuestionTimer();
        this.hideSubmissionControls();

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            setTimeout(() => this.startNextQuestion(), 1500);
        } else {
            this.finishInterview();
        }
    }

    private handleQuestionTimeExpired(): void {
        console.log('Question time limit reached');
        this.clearQuestionTimer();
        this.hideSubmissionControls();

        const userAnswerText = this.speechRecognitionService.getFinalTranscript().trim();

        if (userAnswerText) {
            this.submitCurrentAnswer();
        } else {
            this.handleNoAnswerProvided();
        }
    }

    private handleNoAnswerProvided(): void {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion) {
            this.proceedToNextQuestion();
            return;
        }

        const actualDurationMinutes = currentQuestion.durationInMinutes;

        const emptyAnswer: Answer = {
            id: Date.now().toString(),
            description: '',
            durationInMinutes: actualDurationMinutes
        };

        currentQuestion.answer = emptyAnswer;

        const answerData: CreateAnswerRequest = {
            questionId: currentQuestion.id,
            description: '',
            durationInMinutes: actualDurationMinutes
        };

        this.answerService.createAnswer(answerData).subscribe({
            next: (response) => {
                console.log('Empty answer saved:', response);
            },
            error: (error) => {
                console.error('Failed to save empty answer:', error);
            }
        });

        this.proceedToNextQuestion();
    }

    private clearQuestionTimer(): void {
        if (this.questionInterval) {
            clearInterval(this.questionInterval);
            this.questionInterval = null;
        }
    }

    private hideSubmissionControls(): void {
        this.showSubmitButton = false;
        this.canSubmitAnswer = false;
        this.isWaitingForAnswer = false;
    }

    stopSpeechRecognition(): void {
        this.speechRecognitionService.stop();
        this.liveSubtitle = '';
    }

    finishInterview(): void {
        this.isInterviewInProgress = false;
        this.isInterviewFinalizing = true;
        this.aiSpeaking = false;
        this.hideSubmissionControls();
        this.stopSpeechRecognition();
        this.tts.stop();
        this.clearQuestionTimer();

        this.finalizeInterviewAndSaveEvaluation();
        this.cleanupInterviewResources();

    }

    finalizeInterviewAndSaveEvaluation(): void {
        this.isInterviewFinalizing = false;
        this.isInterviewCompleted = true;
        window.scrollTo(0, 0);

        if (!this.interviewId) {
            console.error('No interview ID available for evaluation');
            this.notify.showError('Error', 'Unable to save evaluation - missing interview ID');
            return;
        }

        const questionsAndAnswers: QuestionsAndAnswersForEvaluationDTO[] = this.questions.map(question => ({
            questionDescription: question.description,
            answerDescription: question.answer?.description || '',
            estimatedAnswerTime: question.durationInMinutes,
            realAnswerTime: question.answer?.durationInMinutes || 0
        }));

        console.log('Interview ID:', this.interviewId);
        console.log('Questions and Answers DTO:', JSON.stringify(questionsAndAnswers, null, 2));
        console.log('Number of questions:', questionsAndAnswers.length);
        console.log('============================');

        this.evaluationService.prepareInterviewEvaluation(this.interviewId, questionsAndAnswers).subscribe({
            next: (evaluation) => {
                console.log('Interview Evaluation:', evaluation);
                this.notify.showSuccess('Interview Completed', 'Your interview has been successfully evaluated.');
                setTimeout(() => {
                    this.router.navigate(['/interview-cloture'], { replaceUrl: true });
                }, 1000);
            },
            error: (err) => {
                console.error('Evaluation error:', err);
                this.notify.showWarning('Evaluation Failed', 'Interview saved, but evaluation failed. Try again later.');
                setTimeout(() => {
                    this.router.navigate(['/interview-cloture'], { replaceUrl: true });
                }, 2000);
            }
        });
    }

    private cleanupInterviewResources(): void {
        this.stopSpeechRecognition();
        this.tts.stop();
        this.tts.clearCache(false);
        this.clearQuestionTimer();
        this.releaseMediaStream();
        this.removeEventListeners();
        this.exitFullscreenMode();
        this.speechRecognitionService.destroy();
    }

    private releaseMediaStream(): void {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
    }

    private removeEventListeners(): void {
        window.removeEventListener('beforeunload', this.preventUnload);
        document.removeEventListener('visibilitychange', this.handleTabSwitch);
        window.removeEventListener('resize', this.handleResize);
        this.eventListenersRegistered = false;
    }

    private exitFullscreenMode(): void {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    private preventUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
    };

    private handleTabSwitch = () => {
        if (document.visibilityState === 'hidden' && this.isInterviewInProgress) {
            this.userWarningMessage = 'Tab switch detected. You are disqualified.';
            this.notify.showError('Disqualified', 'Tab switching is not allowed during the interview.');
        }
    };

    private handleResize = () => {
        if (this.preventResizeOnce) return;
        if (this.isInterviewInProgress) {
            this.userWarningMessage = 'Window resizing is not allowed during interview.';
            this.notify.showWarning('Warning', 'Window resizing is not allowed during the interview.');
        }
    };

    closeWarning(): void {
        this.userWarningMessage = null;
    }

    private scrollTranscriptToBottom(): void {
        setTimeout(() => {
            if (this.scrollPanel && this.scrollPanel.contentViewChild?.nativeElement) {
                const el = this.scrollPanel.contentViewChild.nativeElement;
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                this.scrollPanel.moveBar();
            }
        }, 100);
    }

    ngOnDestroy() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
        }
        if (this.questionInterval) {
            clearInterval(this.questionInterval);
        }

        window.removeEventListener('beforeunload', this.preventUnload);
        document.removeEventListener('visibilitychange', this.handleTabSwitch);
        window.removeEventListener('resize', this.handleResize);

        this.destroy$.next();
        this.destroy$.complete();
        this.cleanupInterviewResources();
    }

    getFormattedTime(): string {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        return `Time left: ${minutes}m ${seconds}s`;
    }

    debugCacheStatus(): void {
        const stats = this.tts.getCacheStats();
        console.log('Current TTS Cache:', stats);
    }
}
