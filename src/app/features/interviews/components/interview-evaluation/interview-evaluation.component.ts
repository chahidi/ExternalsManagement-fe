import { AfterViewInit, Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { InterviewEvaluationService } from '../../../../core/services/interview-evaluation.service';
import { NotificationService } from '../../../../core/services/notification.service';

import { Evaluation } from '../../../../core/models/evaluation';
import { InterviewEvaluationDisplay } from '../../../../core/models/interview-evaluation-display';
import { InterviewInstance } from '../../../../core/models/interview-instance';

@Component({
    selector: 'app-interview-evaluation',
    standalone: true,
    imports: [ProgressSpinnerModule, MessageModule, CommonModule, CardModule, ButtonModule, BadgeModule, TagModule, AccordionModule, ToastModule, TooltipModule],
    providers: [MessageService, NotificationService],
    templateUrl: './interview-evaluation.component.html',
    styleUrls: ['./interview-evaluation.component.scss']
})
export class InterviewEvaluationComponent implements OnInit, AfterViewInit {
    @ViewChildren('scoreCircle') scoreCircles!: QueryList<ElementRef>;

    interview: InterviewInstance | null = null;
    interviewEvaluation?: InterviewEvaluationDisplay;
    evaluations: Evaluation[] = [];

    loading = true;
    error = { happened: false, message: '' };
    animatedScores: Record<string, number> = {};

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private evaluationService: InterviewEvaluationService,
        private messageService: MessageService,
        private notify: NotificationService
    ) {}

    ngOnInit(): void {
        this.interview = history.state?.interview ?? null;

        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.loading = false;
            this.error = { happened: true, message: 'Missing interview id in the route.' };
            return;
        }
        if (!this.interview) {
            const stored = sessionStorage.getItem(`interview_${id}`);
            if (stored) {
                try {
                    this.interview = JSON.parse(stored);
                } catch {}
            }
        }

        this.loadEvaluations(id);
    }

    ngAfterViewInit(): void {
        if (this.evaluations.length > 0) setTimeout(() => this.animateAllScores(), 100);
    }

    private loadEvaluations(interviewId: string): void {
        this.evaluationService.getInterviewEvaluations(interviewId).subscribe({
            next: (data: InterviewEvaluationDisplay) => {
                this.interviewEvaluation = data;
                this.evaluations = data.evaluations ?? [];
                this.evaluations.forEach((e) => (this.animatedScores[e.id] = 0));
                this.loading = false;
                setTimeout(() => this.animateAllScores(), 100);
            },
            error: (err) => {
                console.error('Failed to fetch evaluation:', err);
                this.notify.showError('Error', 'Failed to load evaluation data');
                this.loading = false;
                this.error = { happened: true, message: 'Failed to load evaluation data.' };
            }
        });
    }

    private toDate(v: unknown): Date | null {
        if (v == null) return null;
        const d = new Date(v as any);
        return isNaN(d.getTime()) ? null : d;
    }

    getRealDurationLabel(): string {
        const start = this.toDate(this.interview?.startTime) ?? this.toDate(this.interview?.scheduledAt);
        const end = this.toDate(this.interview?.endTime);
        if (!start || !end) return '—';

        const diffMs = end.getTime() - start.getTime();
        if (diffMs <= 0) return '—';

        const minutes = Math.round(diffMs / 60000);
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m} min`;
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
        const els = this.scoreCircles.toArray();
        this.evaluations.forEach((evaluation, i) => {
            if (els[i]) this.animateScore(els[i].nativeElement, evaluation);
        });
    }
    animateScore(scoreElement: HTMLElement, evaluation: Evaluation): void {
        if (!scoreElement || evaluation.score == null) return;
        const finalScore = evaluation.score;
        const finalDegrees = (finalScore / 100) * 360;
        scoreElement.style.setProperty('--progress-degrees', `${finalDegrees}deg`);
        scoreElement.style.setProperty('--score-color', this.getScoreColor(finalScore));
        scoreElement.classList.add('animate', this.getScoreRangeClass(finalScore));
        this.animateScoreNumber(evaluation.id, finalScore);
        setTimeout(() => scoreElement.classList.add('pulse'), 2000);
    }
    animateScoreNumber(evaluationId: string, targetScore: number): void {
        const duration = 2000;
        const startTime = performance.now();
        const step = (t: number) => {
            const p = Math.min((t - startTime) / duration, 1);
            const e = p < 0.5 ? 4 * p * p * p : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1;
            this.animatedScores[evaluationId] = Math.round(e * targetScore);
            if (p < 1) requestAnimationFrame(step);
            else this.animatedScores[evaluationId] = targetScore;
        };
        requestAnimationFrame(step);
    }
    triggerScoreAnimation(): void {
        if (!this.scoreCircles || !this.evaluations.length) return;
        const els = this.scoreCircles.toArray();
        els.forEach((el) => el.nativeElement.classList.remove('animate', 'pulse'));
        this.evaluations.forEach((e) => (this.animatedScores[e.id] = 0));
        setTimeout(() => this.animateAllScores(), 100);
    }
    getEvaluationTypeDescription(e: Evaluation): string {
        return e.evaluationType?.description || 'General Evaluation';
    }
    getAnimatedScore(id: string): number {
        return this.animatedScores[id] || 0;
    }
    trackByEvaluationId(_: number, e: Evaluation): string {
        return e.id;
    }
}
