


import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { INTERVIEW_RULES, InterviewRule } from '../../../../core/constants/interview-rules.const';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { RecordService } from '../../../../core/services/record.service';
import { Record } from '../../../../core/models/record';
import { InterviewService } from '../../../../core/services/interview.service';
import { PromptService } from '../../../../core/services/prompt.service';
import { Question } from '../../../../core/models/question';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { InterviewEvaluationService } from '../../../../core/services/interview-evaluation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
    selector: 'app-interview-meeting',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, MessageModule, MessagesModule, InputTextModule, PanelModule, ProgressSpinnerModule, ToastModule, DividerModule, TagModule, SkeletonModule, AvatarModule, ScrollPanelModule],
    templateUrl: './interview-meeting.component.html',
    providers: [MessageService, NotificationService],
    animations: [
        trigger('cameraTransition', [
            transition(':enter', [
                style({
                    transform: 'scale(0.5) translateX(-50%) translateY(-30%)',
                    borderRadius: '12px',
                    opacity: 0.8
                }),
                animate(
                    '800ms cubic-bezier(0.35, 0, 0.25, 1)',
                    style({
                        transform: 'scale(1) translateX(0) translateY(0)',
                        borderRadius: '16px',
                        opacity: 1
                    })
                )
            ])
        ]),
        trigger('slideInInterview', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(100%)'
                }),
                animate(
                    '600ms cubic-bezier(0.35, 0, 0.25, 1)',
                    style({
                        opacity: 1,
                        transform: 'translateY(0)'
                    })
                )
            ])
        ]),
        trigger('fadeInControls', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(20px)'
                }),
                animate(
                    '500ms 400ms cubic-bezier(0.35, 0, 0.25, 1)',
                    style({
                        opacity: 1,
                        transform: 'translateY(0)'
                    })
                )
            ])
        ]),
        trigger('slideInTranscript', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateX(100%)'
                }),
                animate(
                    '400ms cubic-bezier(0.35, 0, 0.25, 1)',
                    style({
                        opacity: 1,
                        transform: 'translateX(0)'
                    })
                )
            ]),
            transition(':leave', [
                animate(
                    '300ms cubic-bezier(0.35, 0, 0.25, 1)',
                    style({
                        opacity: 0,
                        transform: 'translateX(100%)'
                    })
                )
            ])
        ]),
        trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in', style({ opacity: 1 }))])])
    ]
})
export class InterviewMeetingComponent implements AfterViewInit, OnDestroy {
    interviewStarted = false;
    previewMode = false;
    isInterviewInProgress = false;
    isInterviewFinalizing = false;
    isInterviewCompleted = false;
    isTranscriptVisible = true;
    currentUserAnswer: string = '';
    userWarningMessage: string | null = null;
    stream: MediaStream | null = null;
    private preventResizeOnce = false;
    isCameraReady = false;
    isCameraEnabled = false;
    showRulesAndPreview = true;
    showSubmitButton = false;
    canSubmitAnswer = false;
    isWaitingForAnswer = false;

    @ViewChild('previewVideo') previewVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild('interviewVideo') interviewVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild('transcriptScroll') scrollPanel!: any;
    mediaRecorder!: MediaRecorder;
    recordedChunks: Blob[] = [];
    recordedBlobUrl: string | null = null;
    interviewStartTime = 0;
    interviewRecord!: Record;

    showSubtitles = false;
    liveSubtitle = '';
    recognition!: any;
    transcriptMessages: { sender: string; text: string; align: 'left' | 'right'; type: 'question' | 'answer' }[] = [];

    questions: Question[] = [];
    currentQuestionIndex = 0;
    timeRemaining = 0;
    questionInterval: any;
    transcriptions: string[] = [];
    currentTime: string = '';
    interviewRules: InterviewRule[] = INTERVIEW_RULES;

    // Speech recognition specific properties
    isListening = false;
    completedTranscript = '';
    liveInterimTranscript = '';
    lastSpeechTime = 0;
    aiSpeaking = false;

    constructor(
        private recordService: RecordService,
        private interviewService: InterviewService,
        private promptService: PromptService,
        private tts: TextToSpeechService,
        private messageService: MessageService,
        private evaluationService: InterviewEvaluationService,
        private notify: NotificationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadInterviewQuestions();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.checkSpeechRecognitionSupport();
        this.isCameraReady = true;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.requestCameraPermission();
        }, 500);
    }

    checkSpeechRecognitionSupport(): void {
        const SpeechAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechAPI) {
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

    loadInterviewQuestions(): void {
        const prompt = 'Give me 5 basic interview questions';
        this.promptService.getQuestions(prompt).subscribe({
            next: (questions) => {
                this.questions = questions;
                this.currentQuestionIndex = 0;
                console.log('Loaded structured questions:', questions);
            },
            error: (err) => {
                console.error('Failed to load structured interview questions:', err);
                this.notify.showError('Error', 'Failed to load interview questions. Please refresh the page.');
            }
        });
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
                audio: true
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

        if (this.isCameraEnabled && this.stream) {
            this.setupMediaRecorder();
        } else {
            this.interviewStartTime = Date.now();
        }

        this.preventResizeOnce = true;
        setTimeout(() => (this.preventResizeOnce = false), 1000);

        this.attachEventListeners();
        this.startNextQuestion();
    }

    private setupMediaRecorder(): void {
        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream!, {
            mimeType: 'video/webm;codecs=vp9'
        });
        this.interviewStartTime = Date.now();

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            this.processRecordedData();
        };

        this.mediaRecorder.start();
    }

    private processRecordedData(): void {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordedBlobUrl = URL.createObjectURL(blob);
        const duration = Math.floor((Date.now() - this.interviewStartTime) / 1000);

        this.interviewRecord = {
            id: Date.now().toString(),
            interviewId: 1,
            recordedAt: new Date(),
            durationInSeconds: duration,
            fileName: `interview-${Date.now()}.webm`,
            fileUrl: this.recordedBlobUrl,
            uploaded: false,
            transcriptionFileUrl: ''
        };

        this.recordService.saveRecord(this.interviewRecord).subscribe({
            next: () => {
                console.log('✅ Record saved');
                this.finalizeRecording();
            },
            error: (err) => {
                console.error('❌ Error saving record:', err);
                this.finalizeRecording();
            }
        });
    }

    private attachEventListeners(): void {
        window.addEventListener('beforeunload', this.preventUnload);
        document.addEventListener('visibilitychange', this.handleTabSwitch);
        window.addEventListener('resize', this.handleResize);
    }

    private resetSpeechRecognitionData(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }

        this.completedTranscript = '';
        this.liveInterimTranscript = '';
        this.liveSubtitle = '';
        this.currentUserAnswer = '';

        console.log('🧹 Speech recognition data reset');
    }

    addCurrentQuestionToTranscript(): void {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (currentQuestion?.text) {
            this.transcriptMessages.push({
                sender: 'AI',
                text: currentQuestion.text,
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
        this.timeRemaining = currentQuestion.timeLimit;
        this.aiSpeaking = true;
        this.hideSubmissionControls();

        this.addCurrentQuestionToTranscript();
        this.initializeQuestionTimer();

        try {
            await this.tts.speak(currentQuestion.text);
            this.aiSpeaking = false;
            this.isWaitingForAnswer = true;
            this.showSubmitButton = true;
            console.log('✅ AI finished speaking, waiting before recognition...');

            this.scheduleDelayedSpeechRecognition();
        } catch (error) {
            console.error('TTS error:', error);
            this.handleTTSError();
        }
    }

    private scheduleDelayedSpeechRecognition(): void {
        setTimeout(() => {
            if (this.isInterviewInProgress && this.timeRemaining > 0) {
                this.resetSpeechRecognitionData();
                this.beginSpeechRecognition();
            }
        }, 2000);
    }

    private handleTTSError(): void {
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

    private initializeSpeechRecognitionEngine(): void {
        const SpeechAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechAPI) {
            this.userWarningMessage = 'Speech recognition is not supported in your browser.';
            return;
        }

        this.recognition = new SpeechAPI();
        this.setupSpeechRecognitionConfiguration();
        this.attachSpeechRecognitionEventHandlers();
    }

    private setupSpeechRecognitionConfiguration(): void {
        this.recognition.lang = 'en-US';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
    }

    private attachSpeechRecognitionEventHandlers(): void {
        this.recognition.onresult = (event: any) => this.handleSpeechRecognitionResult(event);
        this.recognition.onerror = (event: any) => this.handleSpeechRecognitionError(event);
        this.recognition.onend = () => this.handleSpeechRecognitionEnd();
    }

    private handleSpeechRecognitionResult(event: any): void {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        this.completedTranscript += finalTranscript;
        this.liveInterimTranscript = interimTranscript;
        this.liveSubtitle = this.completedTranscript + this.liveInterimTranscript;
        this.currentUserAnswer = this.completedTranscript;

        this.canSubmitAnswer = this.completedTranscript.trim().length > 0;
        this.cdr.detectChanges();
        this.lastSpeechTime = Date.now();
    }

    private handleSpeechRecognitionError(event: any): void {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
            this.notify.showError('Network Error', 'Speech recognition network error. Please check your connection.');
        }
    }

    private handleSpeechRecognitionEnd(): void {
        this.isListening = false;
        console.log('Speech recognition ended');

        if (this.shouldRestartSpeechRecognition()) {
            this.scheduleRestartSpeechRecognition();
        }
    }

    private shouldRestartSpeechRecognition(): boolean {
        return this.isInterviewInProgress &&
               this.currentQuestionIndex < this.questions.length &&
               this.timeRemaining > 0 &&
               !this.aiSpeaking &&
               this.isWaitingForAnswer;
    }

    private scheduleRestartSpeechRecognition(): void {
        setTimeout(() => {
            if (this.shouldRestartSpeechRecognition()) {
                this.beginSpeechRecognition();
            }
        }, 1000);
    }

    private beginSpeechRecognition(): void {
        this.initializeSpeechRecognitionEngine();
        this.isListening = true;
        this.completedTranscript = '';
        this.liveInterimTranscript = '';
        this.recognition.start();
        console.log('Speech recognition started for question:', this.currentQuestionIndex + 1);
    }

    submitCurrentAnswer(): void {
        const userAnswer = this.completedTranscript.trim();
        if (!userAnswer) {
            this.notify.showWarning('No Answer', 'Please provide an answer before submitting.');
            return;
        }

        this.stopSpeechRecognition();
        this.hideSubmissionControls();

        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (currentQuestion) {
            currentQuestion.answer = userAnswer;
        }

        this.transcriptMessages.push({
            sender: 'You',
            text: userAnswer,
            align: 'right',
            type: 'answer'
        });

        console.log('✅ Answer submitted:', userAnswer);
        this.cdr.detectChanges();
        this.scrollTranscriptToBottom();

        this.notify.showSuccess('Answer Submitted', 'Moving to next question...');
        this.proceedToNextQuestion();
    }

    private proceedToNextQuestion(): void {
        this.stopSpeechRecognition();
        this.clearQuestionTimer();
        this.hideSubmissionControls();

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            setTimeout(() => this.startNextQuestion(), 2000);
        } else {
            this.finishInterview();
        }
    }

    private handleQuestionTimeExpired(): void {
        console.log('⏰ Question time limit reached');
        this.clearQuestionTimer();
        this.hideSubmissionControls();

        const userAnswer = this.completedTranscript.trim();

        if (userAnswer) {
            this.submitCurrentAnswer();
        } else {
            this.handleNoAnswerProvided();
        }
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

    private handleNoAnswerProvided(): void {
        console.log('No answer provided within time limit');
        this.notify.showWarning('Time Up', 'No answer provided. Moving to next question.');
        this.proceedToNextQuestion();
    }

    stopSpeechRecognition(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }

        this.liveSubtitle = '';
        console.log('Speech recognition stopped');
    }

    finishInterview(): void {
        this.isInterviewInProgress = false;
        this.isInterviewFinalizing = true;
        this.aiSpeaking = false;
        this.hideSubmissionControls();
        this.stopSpeechRecognition();
        this.tts.stop();
        this.clearQuestionTimer();

        if (this.isCameraEnabled && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            setTimeout(() => {
                if (this.isInterviewFinalizing && !this.isInterviewCompleted) {
                    this.finalizeRecording();
                }
            }, 5000);
        } else {
            this.createInterviewRecordWithoutCamera();
            this.finalizeRecording();
        }

        this.finalizeInterviewAndSaveEvaluation();
        this.cleanupInterviewResources();

        console.log('Full Questions Array:', this.questions);
    }

    private createInterviewRecordWithoutCamera(): void {
        if (!this.isCameraEnabled) {
            const duration = Math.floor((Date.now() - this.interviewStartTime) / 1000);
            this.interviewRecord = {
                id: Date.now().toString(),
                interviewId: 1,
                recordedAt: new Date(),
                durationInSeconds: duration,
                fileName: `interview-audio-${Date.now()}.txt`,
                fileUrl: '',
                uploaded: false,
                transcriptionFileUrl: ''
            };
        }
    }

    finalizeRecording(): void {
        this.isInterviewFinalizing = false;
        this.isInterviewCompleted = true;
        console.log(
            'All answers captured via speech:',
            this.questions.map((q) => q.answer)
        );
        window.scrollTo(0, 0);
        this.notify.showSuccess('Interview Completed', 'Your interview has been successfully recorded and saved.');
    }

    finalizeInterviewAndSaveEvaluation(): void {
        this.isInterviewFinalizing = false;
        this.isInterviewCompleted = true;
        window.scrollTo(0, 0);

        const prompt = 'Evaluate this interview';
        this.evaluationService.prepareInterviewEvaluation(prompt, this.questions).subscribe({
            next: (evaluation) => {
                console.log('Interview Evaluation:', evaluation);
                this.notify.showSuccess('Interview Completed', 'Your interview has been successfully evaluated.');
            },
            error: (err) => {
                console.error('Evaluation error:', err);
                this.notify.showWarning('Evaluation Failed', 'Interview saved, but evaluation failed. Try again later.');
            }
        });
    }

    private cleanupInterviewResources(): void {
        this.stopSpeechRecognition();
        this.tts.stop();
        this.clearQuestionTimer();
        this.releaseMediaStream();
        this.removeEventListeners();
        this.exitFullscreenMode();
    }

    private releaseMediaStream(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    private removeEventListeners(): void {
        window.removeEventListener('beforeunload', this.preventUnload);
        document.removeEventListener('visibilitychange', this.handleTabSwitch);
        window.removeEventListener('resize', this.handleResize);
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
        if (document.visibilityState === 'hidden') {
            this.userWarningMessage = 'Tab switch detected. You are disqualified.';
            this.notify.showError('Disqualified', 'Tab switching is not allowed during the interview.');
        }
    };

    private handleResize = () => {
        if (this.preventResizeOnce) return;
        this.userWarningMessage = 'Window resizing is not allowed during interview.';
        this.notify.showWarning('Warning', 'Window resizing is not allowed during the interview.');
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

    ngOnDestroy(): void {
        this.cleanupInterviewResources();
    }
}
