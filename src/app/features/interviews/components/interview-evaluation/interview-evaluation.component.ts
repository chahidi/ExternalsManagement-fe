import { AfterViewInit, Component, OnInit, ViewChildren, ElementRef, QueryList, OnDestroy } from '@angular/core';
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
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { InterviewEvaluationService } from '../../../../core/services/interview-evaluation.service';
import { NotificationService } from '../../../../core/services/utils/notification.service';
import { LanguageService } from '../../../../core/services/language.service';

import { Evaluation } from '../../../../core/models/evaluation';
import { InterviewEvaluationDisplay } from '../../../../core/models/interview-evaluation-display';
import { InterviewInstance } from '../../../../core/models/interview-instance';

@Component({
    selector: 'app-interview-evaluation',
    standalone: true,
    imports: [
        ProgressSpinnerModule,
        MessageModule,
        CommonModule,
        CardModule,
        ButtonModule,
        BadgeModule,
        TagModule,
        AccordionModule,
        ToastModule,
        TooltipModule,
        TranslateModule
    ],
    providers: [MessageService, NotificationService],
    templateUrl: './interview-evaluation.component.html',
    styleUrls: ['./interview-evaluation.component.scss']
})
export class InterviewEvaluationComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren('scoreCircle') scoreCircles!: QueryList<ElementRef>;

    interview: InterviewInstance | null = null;
    interviewEvaluation?: InterviewEvaluationDisplay;
    evaluations: Evaluation[] = [];

    loading = true;
    error = { happened: false, message: '' };
    animatedScores: Record<string, number> = {};

    overallEvaluation?: Evaluation;
    private languageSubscription?: Subscription;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private evaluationService: InterviewEvaluationService,
        private messageService: MessageService,
        private notify: NotificationService,
        private translate: TranslateService,
        private languageService: LanguageService
    ) { }

    ngOnInit(): void {
        // Set initial language from LanguageService
        const currentLang = this.languageService.getCurrentLanguage();
        this.translate.use(currentLang);

        // Subscribe to language changes
        this.languageSubscription = this.languageService.getLanguageObservable().subscribe(lang => {
            this.translate.use(lang);
        });

        this.interview = history.state?.interview ?? null;

        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.loading = false;
            this.error = { happened: true, message: this.translate.instant('evaluationinterview.missingInterviewId') };
            return;
        }
        if (!this.interview) {
            const stored = sessionStorage.getItem(`interview_${id}`);
            if (stored) {
                try {
                    this.interview = JSON.parse(stored);
                } catch { }
            }
        }

        this.loadEvaluations(id);
    }

    ngAfterViewInit(): void {
        if (this.evaluations.length > 0) setTimeout(() => this.animateAllScores(), 100);
    }

    ngOnDestroy(): void {
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }
    }

    private loadEvaluations(interviewId: string): void {
        this.evaluationService.getInterviewEvaluations(interviewId).subscribe({
            next: (data: InterviewEvaluationDisplay) => {
                this.interviewEvaluation = data;
                this.evaluations = data.evaluations ?? [];
                this.evaluations.forEach((e) => (this.animatedScores[e.id] = 0));
                 this.overallEvaluation = this.evaluations.find(
                e => e.evaluationType?.description === 'OverAll'
            );

            // Debug log
            console.log('Evaluations loaded:', this.evaluations);
            console.log('Overall evaluation:', this.overallEvaluation);
                this.loading = false;
                setTimeout(() => this.animateAllScores(), 100);
            },
            error: (err) => {
                console.error('Failed to fetch evaluation:', err);
                this.notify.showError(
                    this.translate.instant('evaluationinterview.error'),
                    this.translate.instant('evaluationinterview.failedToLoadData')
                );
                this.loading = false;
                this.error = {
                    happened: true,
                    message: this.translate.instant('evaluationinterview.failedToLoadData')
                };
            }
        });
    }

    private toDate(v: unknown): Date | null {
        if (v == null) return null;
        const d = new Date(v as any);
        return isNaN(d.getTime()) ? null : d;
    }

    getProgressDegrees(score: number): string {
        const degrees = (score / 100) * 360;
        return degrees + 'deg';
    }

    getRealDurationLabel(): string {
        const start = this.toDate(this.interview?.startTime) ?? this.toDate(this.interview?.scheduledAt);
        const end = this.toDate(this.interview?.endTime);
        if (!start || !end) return this.translate.instant('evaluationinterview.notAvailable');

        const diffMs = end.getTime() - start.getTime();
        if (diffMs <= 0) return this.translate.instant('evaluationinterview.notAvailable');

        const minutes = Math.round(diffMs / 60000);
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        if (h > 0) {
            return this.translate.instant('evaluationinterview.durationHoursMinutes', { hours: h, minutes: m });
        } else {
            return this.translate.instant('evaluationinterview.durationMinutes', { minutes: m });
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
        return e.evaluationType?.description || this.translate.instant('evaluationinterview.generalEvaluation');
    }

    getAnimatedScore(id: string): number {
        return this.animatedScores[id] || 0;
    }

    trackByEvaluationId(_: number, e: Evaluation): string {
        return e.id;
    }

    get nonOverallEvaluations() {
        return this.evaluations.filter(e => this.getEvaluationTypeDescription(e) !== 'OverAll');
    }
}
