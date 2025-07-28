import { AfterViewInit, Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
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
    @ViewChildren('scoreCircle') scoreCircles!: QueryList<ElementRef>;

    interview: InterviewInstance | null = null;
    evaluations: Evaluation[] = [];
    loading = true;
    error = {
        happened: false,
        message: ''
    };

    animatedScores: { [key: string]: number } = {};

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

        this.loadEvaluations();
    }

    ngAfterViewInit(): void {
        if (this.evaluations.length > 0) {
            setTimeout(() => this.animateAllScores(), 100);
        }
    }

    private loadEvaluations(): void {
        this.evaluationService.getInterviewEvaluation(this.interview!.id).subscribe({
            next: (data) => {
                this.evaluations = Array.isArray(data) ? data : [data];
                this.evaluations.forEach((evaluation) => {
                    this.animatedScores[evaluation.id] = 0;
                });
                this.loading = false;
                setTimeout(() => this.animateAllScores(), 100);
            },
            error: (err) => {
                console.error('Failed to fetch evaluation:', err);
                this.notify.showError('Error', 'Failed to load evaluation data');
                this.loading = false;
            }
        });
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

    animateAllScores(): void {
        if (!this.scoreCircles) return;
        const scoreElements = this.scoreCircles.toArray();
        this.evaluations.forEach((evaluation, index) => {
            if (scoreElements[index]) {
                this.animateScore(scoreElements[index].nativeElement, evaluation);
            }
        });
    }

    animateScore(scoreElement: HTMLElement, evaluation: Evaluation): void {
        if (!scoreElement || evaluation.score == null) return;
        const finalScore = evaluation.score;
        const finalDegrees = (finalScore / 100) * 360;
        scoreElement.style.setProperty('--progress-degrees', `${finalDegrees}deg`);
        scoreElement.style.setProperty('--score-color', this.getScoreColor(finalScore));
        scoreElement.classList.add('animate');
        scoreElement.classList.add(this.getScoreRangeClass(finalScore));
        this.animateScoreNumber(evaluation.id, finalScore);
        setTimeout(() => {
            scoreElement.classList.add('pulse');
        }, 2000);
    }

    animateScoreNumber(evaluationId: string, targetScore: number): void {
        const duration = 2000;
        const startTime = performance.now();
        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeInOutCubic(progress);
            this.animatedScores[evaluationId] = Math.round(easeProgress * targetScore);
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.animatedScores[evaluationId] = targetScore;
            }
        };
        requestAnimationFrame(animate);
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    triggerScoreAnimation(): void {
        if (this.scoreCircles && this.evaluations.length > 0) {
            const scoreElements = this.scoreCircles.toArray();
            scoreElements.forEach((el) => el.nativeElement.classList.remove('animate', 'pulse'));
            this.evaluations.forEach((e) => (this.animatedScores[e.id] = 0));
            setTimeout(() => this.animateAllScores(), 100);
        }
    }

    getEvaluationTypeDescription(evaluation: Evaluation): string {
        return evaluation.evaluationType?.description || 'General Evaluation';
    }

    getAnimatedScore(evaluationId: string): number {
        return this.animatedScores[evaluationId] || 0;
    }

    trackByEvaluationId(index: number, evaluation: Evaluation): string {
        return evaluation.id;
    }
}
