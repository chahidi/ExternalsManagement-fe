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
import { PromptService } from '../../../../core/services/prompt.service';
import { Question } from '../../../../core/models/question';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { InterviewEvaluationService } from '../../../../core/services/interview-evaluation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Router } from '@angular/router';

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

    private eventListenersRegistered = false;

    constructor(
        private recordService: RecordService,
        private promptService: PromptService,
        private tts: TextToSpeechService,
        private evaluationService: InterviewEvaluationService,
        private notify: NotificationService,
        private cdr: ChangeDetectorRef,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadInterviewQuestions();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initializeCamera();
        }, 500);
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
                this.notify.showError('Error', 'Failed to load interview questions. Please refresh the page.')
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
            console.log('Video tracks:', this.stream.getVideoTracks());

            this.cameraReady = true;
            this.previewMode = true;
            setTimeout(() => {
                this.setupPreviewVideo();
            }, 100);
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.warningMessage = 'Camera access denied. Please enable your camera and reload the page.';
            this.cameraReady = false;
            this.notify.showError('Camera Error', 'Unable to access camera. Please check your permissions.')
        }
    }

    private setupPreviewVideo() {
        if (this.previewVideo?.nativeElement && this.stream) {
            const video = this.previewVideo.nativeElement;
            console.log('Setting up preview video element:', video);

            video.srcObject = this.stream;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;

            video.onloadedmetadata = () => {
                console.log('Preview video metadata loaded');
                video.play().catch((e) => console.error('Error playing preview video:', e));
            };

            video.onerror = (e) => {
                console.error('Preview video error:', e);
            };
        } else {
            console.warn('Preview video element not found or stream not available');
        }
    }

    private setupInterviewVideo() {
        if (this.interviewVideo?.nativeElement && this.stream) {
            const video = this.interviewVideo.nativeElement;
            console.log('Setting up interview video element:', video);

            video.srcObject = this.stream;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;

            video.onloadedmetadata = () => {
                console.log('Interview video metadata loaded');
                video.play().catch((e) => console.error('Error playing interview video:', e));
            };

            video.onerror = (e) => {
                console.error('Interview video error:', e);
            };
        } else {
            console.warn('Interview video element not found or stream not available');
        }
    }

    async startInterview() {
        if (!this.cameraReady || !this.stream) {
            this.notify.showWarning('Camera Not Ready', 'Please allow camera access before starting the interview.')
            return;
        }

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
        setTimeout(() => {
            this.setupInterviewVideo();
        }, 100);

        // Initialize recording
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
        this.preventResizeOnce = true;
        setTimeout(() => (this.preventResizeOnce = false), 1000);

        if (!this.eventListenersRegistered) {
            window.addEventListener('beforeunload', this.preventUnload);
            document.addEventListener('visibilitychange', this.handleTabSwitch);
            window.addEventListener('resize', this.handleResize);
            this.eventListenersRegistered = true;
        }

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

    submitAnswer(): void {
        const answer = this.currentAnswerText.trim();
        if (!answer) return;

        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (currentQuestion) {
            currentQuestion.answer = answer;
        }

        this.transcriptMessages.push({
            sender: 'You',
            text: answer,
            align: 'right',
            type: 'answer'
        });

        this.currentAnswerText = '';
        clearInterval(this.questionInterval);
        this.stopTranscription();

        this.transcriptions.push(this.liveSubtitle.trim());

        this.cdr.detectChanges();
        this.scrollTranscriptToBottom();

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            setTimeout(() => this.startNextQuestion(), 2000);
        } else {
            this.finishInterview();
        }
    }

    async startNextQuestion() {
        const current = this.questions[this.currentQuestionIndex];
        if (!current || !this.interviewInProgress) return;

        this.timeRemaining = current.timeLimit;
        this.liveSubtitle = '';

        this.addCurrentQuestionToTranscript();

        await this.tts.speak(current.text);
        this.startTranscription();

        this.questionInterval = setInterval(() => {
            this.timeRemaining--;
            if (this.timeRemaining <= 0) {
                clearInterval(this.questionInterval);
                this.stopTranscription();
                this.transcriptions.push(this.liveSubtitle.trim());
                this.currentQuestionIndex++;

                if (this.currentQuestionIndex < this.questions.length) {
                    this.startNextQuestion();
                } else {
                    this.finishInterview();
                }
            }
        }, 1000);
    }

    finishInterview() {
        this.interviewInProgress = false;
        this.interviewFinalizing = true;
        this.stopTranscription();
        this.tts.stop();

        if (this.questionInterval) {
            clearInterval(this.questionInterval);
            this.questionInterval = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();

            setTimeout(() => {
                if (this.interviewFinalizing && !this.interviewCompleted) {
                    this.finalizeRecording();
                }
            }, 5000);
        } else {
            this.finalizeRecording();
        }

        this.finalizeInterviewAnSaveEvaluation();

        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        console.log('Full Questions Array:', this.questions);

        window.removeEventListener('beforeunload', this.preventUnload);
        document.removeEventListener('visibilitychange', this.handleTabSwitch);
        window.removeEventListener('resize', this.handleResize);
    }

    finalizeRecording() {
        this.interviewFinalizing = false;
        this.interviewCompleted = true;
        console.log('📋 All transcriptions:', this.transcriptions);
        window.scrollTo(0, 0);
        this.notify.showSuccess('Interview Completed', 'Your interview has been successfully recorded and saved.')
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
                setTimeout(() => {
                    this.router.navigate(['/interview-cloture'], { replaceUrl: true });
                }, 2000);
            },
            error: (err) => {
                console.error('Evaluation error:', err);
                this.notify.showWarning('Evaluation Failed', 'Interview saved, but evaluation failed. Try again later.');
            }
        });

    }



    startTranscription() {
        const SpeechAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechAPI) {
            this.warningMessage = 'Speech recognition is not supported in your browser.';
            return;
        }

        this.recognition = new SpeechAPI();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join('');
            this.liveSubtitle = transcript;
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            this.warningMessage = 'Speech recognition error: ' + event.error;
        };

        this.recognition.start();
    }

    stopTranscription() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.liveSubtitle = '';
    }

    private preventUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
    };

    private handleTabSwitch = () => {
        if (document.visibilityState === 'hidden') {
            this.warningMessage = 'Tab switch detected. You are disqualified.';
            this.notify.showError('Disqualified', 'Tab switching is not allowed during the interview.')
        }
    };

    private handleResize = () => {
        if (this.preventResizeOnce) return;
        this.warningMessage = 'Window resizing is not allowed during interview.';
        this.notify.showWarning('Warning', 'Window resizing is not allowed during the interview.')
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
            this.questionInterval = null;
        }
        if (this.recognition) {
            this.recognition.stop();
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        this.mediaRecorder = null!;
        this.recordedChunks = [];
        this.recordedBlobUrl = null;

        if (this.eventListenersRegistered) {
            window.removeEventListener('beforeunload', this.preventUnload);
            document.removeEventListener('visibilitychange', this.handleTabSwitch);
            window.removeEventListener('resize', this.handleResize);
        }
    }
}
