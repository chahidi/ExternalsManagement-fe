import { Component, OnInit } from '@angular/core';
import { InterviewInstance } from '../../../../core/models/interview-instance';
import { Evaluation } from '../../../../core/models/evaluation';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InterviewEvaluationService } from '../../../../core/services/interview-evaluation.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-interview-evaluation',
  standalone: true,
  imports: [ProgressSpinnerModule,MessageModule,CommonModule],
  providers: [MessageService],
  templateUrl: './interview-evaluation.component.html',
  styleUrls: ['./interview-evaluation.component.scss']
})
export class InterviewEvaluationComponent implements OnInit {
  interview: InterviewInstance | null = null;
  evaluation: Evaluation | null = null;
  loading = true;
  error = {
    happened: false,
    message: ""
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private evaluationService: InterviewEvaluationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.interview = history.state.interview;
    if (!this.interview) {
      this.loading = false;
      this.error.happened = true;
      this.error.message = "An error occured while trying to evaluate this interview could you ty again later.";
      return;
    }

    this.evaluationService.getInterviewEvaluation("Please evaluate this candidate", this.interview.questions).subscribe({
      next: (data) => {
        this.evaluation = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch evaluation:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load evaluation data'
        });
        this.loading = false;
      }
    });
  }

}
