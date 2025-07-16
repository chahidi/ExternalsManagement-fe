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
    interviewInProgress = false;
    interviewFinalizing = false;
    interviewCompleted = false;
    transcriptVisible = true;
    currentAnswerText: string = '';
    warningMessage: string | null = null;
    stream: MediaStream | null = null;
    private preventResizeOnce = false;
    cameraReady = false;
    cameraEnabled = false;
    showRulesAndPreview = true;

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
    finalTranscript = '';
    interimTranscript = '';
    lastSpeechTime = 0;
    aiSpeaking = false; // Track if AI is currently speaking

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
        this.cameraReady = true;
    }

    ngAfterViewInit(): void {
        // Optional camera initialization
        setTimeout(() => {
            this.initializeCamera();
        }, 500);
    }

    checkSpeechRecognitionSupport(): void {
        const SpeechAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechAPI) {
            this.warningMessage = 'Speech recognition is not supported in your browser. Please use Chrome or Edge.';
            this.notify.showError('Browser Not Supported', 'Speech recognition requires Chrome or Edge browser.');
        }
    }

    updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.currentTime = `${hours}:${minutes}`;
    }

    loadInterviewQuestions(): void {
        const prompt = 'Give me 5 basic interview questions';
        this.promptService.getQuestions(prompt).subscribe({
            next: (q) => {
                this.questions = q;
                this.currentQuestionIndex = 0;
                console.log('Loaded structured questions:', q);
            },
            error: (err) => {
                console.error('Failed to load structured interview questions:', err);
                this.notify.showError('Error', 'Failed to load interview questions. Please refresh the page.');
            }
        });
    }

    async initializeCamera() {
        try {
            console.log('Initializing camera...');
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });

            console.log('Camera stream obtained:', this.stream);
            this.cameraEnabled = true;
            this.previewMode = true;
            setTimeout(() => {
                this.setupPreviewVideo();
            }, 100);
        } catch (error) {
            console.warn('Camera initialization failed, proceeding without camera:', error);
            this.cameraEnabled = false;
            this.previewMode = false;
            // Don't show error message, just proceed without camera
        }
    }

    private setupPreviewVideo() {
        if (this.previewVideo?.nativeElement && this.stream) {
            const video = this.previewVideo.nativeElement;
            video.srcObject = this.stream;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;
            video.onloadedmetadata = () => {
                video.play().catch((e) => console.error('Error playing preview video:', e));
            };
        }
    }

    private setupInterviewVideo() {
        if (this.interviewVideo?.nativeElement && this.stream) {
            const video = this.interviewVideo.nativeElement;
            video.srcObject = this.stream;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;
            video.onloadedmetadata = () => {
                video.play().catch((e) => console.error('Error playing interview video:', e));
            };
        }
    }

    async startInterview() {
        console.log('Starting interview...');
        this.interviewStarted = true;
        this.showRulesAndPreview = false;
        this.interviewInProgress = true;
        this.previewMode = false;

        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.warn('Could not enter fullscreen mode:', error);
        }

        if (this.cameraEnabled) {
            setTimeout(() => {
                this.setupInterviewVideo();
            }, 100);
        }

        if (this.cameraEnabled && this.stream) {
            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            this.interviewStartTime = Date.now();

            this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
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
            };

            this.mediaRecorder.start();
        } else {
            this.interviewStartTime = Date.now();
        }

        this.preventResizeOnce = true;
        setTimeout(() => (this.preventResizeOnce = false), 1000);

        window.addEventListener('beforeunload', this.preventUnload);
        document.addEventListener('visibilitychange', this.handleTabSwitch);
        window.addEventListener('resize', this.handleResize);

        this.startNextQuestion();
    }

    addCurrentQuestionToTranscript() {
        const questionText = this.questions[this.currentQuestionIndex]?.text;
        if (questionText) {
            this.transcriptMessages.push({
                sender: 'AI',
                text: questionText,
                align: 'left',
                type: 'question'
            });
            this.cdr.detectChanges();
            this.scrollTranscriptToBottom();
        }
    }

    async startNextQuestion() {
        const current = this.questions[this.currentQuestionIndex];
        if (!current || !this.interviewInProgress) return;

        this.timeRemaining = current.timeLimit;
        this.liveSubtitle = '';
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.aiSpeaking = true; // Mark AI as speaking

        this.addCurrentQuestionToTranscript();
        this.questionInterval = setInterval(() => {
            this.timeRemaining--;
            if (this.timeRemaining <= 0) {
                this.handleQuestionTimeout();
            }
        }, 1000);

        try {
            await this.tts.speak(current.text);
            this.aiSpeaking = false; // AI finished speaking
            console.log(' AI finished speaking, starting speech recognition...');

            setTimeout(() => {
                if (this.interviewInProgress && this.timeRemaining > 0) {
                    this.startSpeechRecognition();
                }
            }, 500);
        } catch (error) {
            console.error('TTS error:', error);
            this.aiSpeaking = false; // AI finished speaking
            setTimeout(() => {
                if (this.interviewInProgress && this.timeRemaining > 0) {
                    this.startSpeechRecognition();
                }
            }, 1000);
        }
    }

    startSpeechRecognition() {
        const SpeechAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechAPI) {
            this.warningMessage = 'Speech recognition is not supported in your browser.';
            return;
        }

        this.recognition = new SpeechAPI();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.isListening = true;
        this.finalTranscript = '';
        this.interimTranscript = '';

        this.recognition.onresult = (event: any) => {
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

            this.finalTranscript += finalTranscript;
            this.interimTranscript = interimTranscript;
            this.liveSubtitle = this.finalTranscript + this.interimTranscript;
            this.currentAnswerText = this.finalTranscript;
            this.cdr.detectChanges();
            this.lastSpeechTime = Date.now();
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'network') {
                this.notify.showError('Network Error', 'Speech recognition network error. Please check your connection.');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Speech recognition ended');

            // Only restart if interview is still in progress, time remaining, and AI not speaking
            if (this.interviewInProgress && this.currentQuestionIndex < this.questions.length && this.timeRemaining > 0 && !this.aiSpeaking) {
                console.log('Restarting speech recognition...');
                setTimeout(() => {
                    if (this.interviewInProgress && this.timeRemaining > 0 && !this.aiSpeaking) {
                        this.startSpeechRecognition();
                    }
                }, 1000);
            }
        };

        this.recognition.start();
        console.log('Speech recognition started for question:', this.currentQuestionIndex + 1);
    }

    submitCurrentAnswer() {
        const answer = this.finalTranscript.trim();
        if (!answer) return;

        this.stopSpeechRecognition();

        // Save answer to current question
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (currentQuestion) {
            currentQuestion.answer = answer;
        }

        // Add to transcript
        this.transcriptMessages.push({
            sender: 'You',
            text: answer,
            align: 'right',
            type: 'answer'
        });

        console.log('Answer saved:', answer);
        this.cdr.detectChanges();
        this.scrollTranscriptToBottom();

        this.moveToNextQuestion();
    }

    moveToNextQuestion() {
        this.stopSpeechRecognition();
        clearInterval(this.questionInterval);

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            setTimeout(() => this.startNextQuestion(), 2000);
        } else {
            this.finishInterview();
        }
    }

    handleQuestionTimeout() {
        console.log('Question timeout reached');
        clearInterval(this.questionInterval);

        const answer = this.finalTranscript.trim();

        if (answer) {
            this.submitCurrentAnswer();
        } else {
            console.log('No answer provided within time limit');
            this.moveToNextQuestion();
        }
    }

    stopSpeechRecognition() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }

        this.liveSubtitle = '';
        console.log('Speech recognition stopped');
    }

    submitAnswer(): void {
        this.submitCurrentAnswer();
    }

    finishInterview() {
        this.interviewInProgress = false;
        this.interviewFinalizing = true;
        this.aiSpeaking = false;
        this.stopSpeechRecognition();
        this.tts.stop();

        if (this.questionInterval) {
            clearInterval(this.questionInterval);
            this.questionInterval = null;
        }

        if (this.cameraEnabled && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            setTimeout(() => {
                if (this.interviewFinalizing && !this.interviewCompleted) {
                    this.finalizeRecording();
                }
            }, 5000);
        } else {
            if (!this.cameraEnabled) {
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
            this.finalizeRecording();
        }

        this.finalizeInterviewAnSaveEvaluation();
        if (this.stream) {
            this.stream.getTracks().forEach((t) => t.stop());
            this.stream = null;
        }

        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        console.log('Full Questions Array:', this.questions);

        // Remove event listeners
        window.removeEventListener('beforeunload', this.preventUnload);
        document.removeEventListener('visibilitychange', this.handleTabSwitch);
        window.removeEventListener('resize', this.handleResize);
    }

    finalizeRecording() {
        this.interviewFinalizing = false;
        this.interviewCompleted = true;
        console.log(
            'All answers captured via speech:',
            this.questions.map((q) => q.answer)
        );
        window.scrollTo(0, 0);
        this.notify.showSuccess('Interview Completed', 'Your interview has been successfully recorded and saved.');
    }

    finalizeInterviewAnSaveEvaluation() {
        this.interviewFinalizing = false;
        this.interviewCompleted = true;
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

    startTranscription() {
        this.startSpeechRecognition();
    }

    stopTranscription() {
        this.stopSpeechRecognition();
    }

    private preventUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
    };

    private handleTabSwitch = () => {
        if (document.visibilityState === 'hidden') {
            this.warningMessage = 'Tab switch detected. You are disqualified.';
            this.notify.showError('Disqualified', 'Tab switching is not allowed during the interview.');
        }
    };

    private handleResize = () => {
        if (this.preventResizeOnce) return;
        this.warningMessage = 'Window resizing is not allowed during interview.';
        this.notify.showWarning('Warning', 'Window resizing is not allowed during the interview.');
    };

    closeWarning() {
        this.warningMessage = null;
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
        if (this.recognition) {
            this.recognition.stop();
        }

        // Clean up event listeners
        window.removeEventListener('beforeunload', this.preventUnload);
        document.removeEventListener('visibilitychange', this.handleTabSwitch);
        window.removeEventListener('resize', this.handleResize);
    }
}
