import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { InterviewInstance } from '../../../../core/models/interview-instance';
import { Evaluation } from '../../../../core/models/evaluation';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InterviewEvaluationService } from '../../../../core/services/interview-evaluation.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { NotificationService } from '../../../../core/services/notification.service';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-interview-evaluation',
    standalone: true,
    imports: [ProgressSpinnerModule, MessageModule, CommonModule, CardModule, ButtonModule, BadgeModule, TagModule, AccordionModule, ToastModule],
    providers: [MessageService, NotificationService],
    templateUrl: './interview-evaluation.component.html',
    styleUrls: ['./interview-evaluation.component.scss']
})
export class InterviewEvaluationComponent implements OnInit, AfterViewInit {
    @ViewChild('scoreCircle', { static: false }) scoreCircle!: ElementRef;

    interview: InterviewInstance | null = null;
    evaluation: Evaluation | null = null;
    loading = true;
    error = {
        happened: false,
        message: ''
    };

    animatedScore = 0;
    finalScore = 0;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private evaluationService: InterviewEvaluationService,
        private messageService: MessageService,
        private notify: NotificationService
    ) {}

    ngOnInit(): void {
        this.interview = history.state.interview;

        if (!this.interview) {
            const interviewId = this.route.snapshot.paramMap.get('id');
            if (interviewId) {
                const storedInterview = sessionStorage.getItem(`interview_${interviewId}`);
                if (storedInterview) {
                    try {
                        this.interview = JSON.parse(storedInterview);
                        // Clean up after use
                        sessionStorage.removeItem(`interview_${interviewId}`);
                    } catch (error) {
                        console.error('Error parsing stored interview data:', error);
                    }
                }
            }
        }

        if (!this.interview) {
            this.loading = false;
            this.error.happened = true;
            this.error.message = 'An error occurred while trying to evaluate this interview. Could you try again later.';
            return;
        }

        this.evaluationService.getInterviewEvaluation(this.interview.id).subscribe({
            next: (data) => {
                this.evaluation = data;
                this.finalScore = this.evaluation?.score || 0;
                this.loading = false;
                console.log('evaluation: ', this.finalScore);
                this.checkAndStartAnimation();
            },
            error: (err) => {
                console.error('Failed to fetch evaluation:', err);
                this.notify.showError('Error', 'Failed to load evaluation data');
                this.loading = false;
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.evaluation?.score) {
            this.animateScore();
        }
    }

    getScoreRangeClass(score: number): string {
        if (score >= 75) return 'score-75-100';
        if (score >= 50) return 'score-50-75';
        if (score >= 25) return 'score-25-50';
        return 'score-0-25';
    }

    getScoreColor(score: number): string {
        if (score >= 75) return 'var(--primary-color)';
        if (score >= 50) return '#eab308';
        if (score >= 25) return '#f97316';
        return '#ef4444';
    }

    getScoreTextClass(score: number): string {
        if (score >= 75) return 'score-excellent';
        if (score >= 50) return 'score-good';
        if (score >= 25) return 'score-average';
        return 'score-poor';
    }

    animateScore(): void {
        const scoreElement = this.scoreCircle?.nativeElement;
        if (!scoreElement || !this.evaluation?.score) return;

        const finalScore = this.evaluation.score;
        const finalDegrees = (finalScore / 100) * 360;

        scoreElement.style.setProperty('--progress-degrees', `${finalDegrees}deg`);
        scoreElement.style.setProperty('--score-color', this.getScoreColor(finalScore));

        scoreElement.classList.add('animate');
        scoreElement.classList.add(this.getScoreRangeClass(finalScore));

        this.animateScoreNumber(finalScore);

        setTimeout(() => {
            scoreElement.classList.add('pulse');
        }, 2000);
    }

    animateScoreNumber(targetScore: number): void {
        const duration = 2000;
        const startTime = performance.now();

        const element = this.scoreCircle.nativeElement;

        element.style.setProperty('--score-color', this.getScoreColor(targetScore));

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeInOutCubic(progress);

            this.animatedScore = Math.round(easeProgress * targetScore);
            const degrees = (this.animatedScore / 100) * 360;

            element.style.setProperty('--progress-degrees', `${degrees}deg`);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.animatedScore = targetScore;
            }
        };

        requestAnimationFrame(animate);
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    triggerScoreAnimation(): void {
        if (this.scoreCircle && this.evaluation?.score) {
            const element = this.scoreCircle.nativeElement;
            element.classList.remove('animate', 'pulse');
            element.classList.remove('score-0-25', 'score-25-50', 'score-50-75', 'score-75-100');

            this.animatedScore = 0;

            setTimeout(() => {
                this.animateScore();
            }, 100);
        }
    }

    private checkAndStartAnimation(): void {
        setTimeout(() => {
            if (!this.loading && this.evaluation?.score && this.scoreCircle) {
                this.animateScore();
            }
        }, 100);
    }
}
