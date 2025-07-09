import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService } from '../../../../core/services/record.service';
import { Record } from '../../../../core/models/record';
import { InterviewService } from '../../../../core/services/interview.service';
import { PromptService } from '../../../../core/services/prompt.service';
import { Question } from '../../../../core/models/question';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-interview-meeting',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './interview-meeting.component.html'
})
export class InterviewMeetingComponent {
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

    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

    mediaRecorder!: MediaRecorder;
    recordedChunks: Blob[] = [];
    recordedBlobUrl: string | null = null;
    interviewStartTime = 0;
    interviewRecord!: Record;

    showSubtitles = false;
    liveSubtitle = '';
    recognition!: any;
    transcriptMessages: { sender: string; text: string; align: 'left' | 'right'; type: 'question' | 'answer' }[] = [];
    addCurrentQuestionToTranscript() {
        const questionText = this.questions[this.currentQuestionIndex]?.text;
        if (questionText) {
            this.transcriptMessages.push({
                sender: 'AI',
                text: questionText,
                align: 'left',
                type: 'question'
            });
        }
    }

    questions: Question[] = [];
    currentQuestionIndex = 0;
    timeRemaining = 0;
    questionInterval: any;

    transcriptions: string[] = [];

    constructor(
        private recordService: RecordService,
        private interviewService: InterviewService,
        private promptService: PromptService,
        private tts: TextToSpeechService
    ) {}

    ngOnInit(): void {
        this.loadInterviewQuestions();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
    currentTime: string = '';

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

        // Push question to Live Transcript
        this.addCurrentQuestionToTranscript();

        //  Speak and then start transcription
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

        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
            console.log(' Full Questions Array:', this.questions);

        window.removeEventListener('beforeunload', this.preventUnload);
        document.removeEventListener('visibilitychange', this.handleTabSwitch);
        window.removeEventListener('resize', this.handleResize);
    }

    finalizeRecording() {
        this.interviewFinalizing = false;
        this.interviewCompleted = true;
        console.log('📋 All transcriptions:', this.transcriptions);
        window.scrollTo(0, 0);
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
