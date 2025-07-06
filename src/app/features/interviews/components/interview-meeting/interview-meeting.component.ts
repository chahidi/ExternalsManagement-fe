import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService } from '../../../../core/services/record.service';
import { Record } from '../../../../core/models/record';
import { InterviewService } from '../../../../core/services/interview.service';
import { PromptService } from '../../../../core/services/prompt.service';
import { Question } from '../../../../core/models/question';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';

@Component({
    selector: 'app-interview-meeting',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './interview-meeting.component.html'
})
export class InterviewMeetingComponent {
    interviewStarted = false;
    previewMode = false;
    interviewInProgress = false;
    interviewFinalizing = false;
    interviewCompleted = false;
    transcriptVisible: boolean = true;

    warningMessage: string | null = null;
    stream: MediaStream | null = null;
    private preventResizeOnce = false;

    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

    mediaRecorder!: MediaRecorder;
    recordedChunks: Blob[] = [];
    recordedBlobUrl: string | null = null;
    interviewStartTime: number = 0;
    interviewRecord!: Record;

    showSubtitles: boolean = false;
    liveSubtitle: string = '';
    recognition!: any;

    questions: Question[] = [];
    currentQuestionIndex = 0;
    timeRemaining = 0;
    questionInterval: any;

    constructor(
        private recordService: RecordService,
        private interviewService: InterviewService,
        private promptService: PromptService,
        private tts: TextToSpeechService
    ) {}

    ngOnInit(): void {
        this.loadInterviewQuestions();
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
            }
        });
    }

    async prepareInterview() {
        this.previewMode = true;
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const video = this.videoElement.nativeElement;
            video.srcObject = this.stream;
            video.muted = true;
            await video.play();
        } catch {
            this.warningMessage = 'Camera access denied. Please enable your camera and reload the page.';
            this.previewMode = false;
        }
    }

    async startInterview() {
        this.interviewStarted = true;
        this.previewMode = false;
        this.interviewInProgress = true;

        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }

        const video = this.videoElement.nativeElement;
        video.srcObject = this.stream;
        video.muted = true;
        await video.play();

        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream!);
        this.interviewStartTime = Date.now();

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) this.recordedChunks.push(event.data);
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

        window.addEventListener('beforeunload', this.preventUnload);
        document.addEventListener('visibilitychange', this.handleTabSwitch);
        window.addEventListener('resize', this.handleResize);

        this.startNextQuestion();
    }

    startNextQuestion() {
        const current = this.questions[this.currentQuestionIndex];
        if (!current) return;

        if (!this.interviewInProgress) return;

        this.speakCurrentQuestion();

        this.timeRemaining = current.timeLimit;

        this.questionInterval = setInterval(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                clearInterval(this.questionInterval);
                this.currentQuestionIndex++;

                if (this.currentQuestionIndex < this.questions.length) {
                    this.startNextQuestion();
                } else {
                    this.finishInterview();
                }
            }
        }, 1000);
    }

    speakCurrentQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (question) {
            this.tts.speak(question.text);
        }
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

        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        window.removeEventListener('beforeunload', this.preventUnload);
        document.removeEventListener('visibilitychange', this.handleTabSwitch);
        window.removeEventListener('resize', this.handleResize);
    }

    finalizeRecording() {
        this.interviewFinalizing = false;
        this.interviewCompleted = true;
        window.scrollTo(0, 0);
    }

    toggleSubtitles() {
        this.showSubtitles = !this.showSubtitles;
        this.showSubtitles ? this.startTranscription() : this.stopTranscription();
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
        }
    };

    private handleResize = () => {
        if (this.preventResizeOnce) return;
        this.warningMessage = 'Window resizing is not allowed during interview.';
    };

    closeWarning() {
        this.warningMessage = null;
    }
}
