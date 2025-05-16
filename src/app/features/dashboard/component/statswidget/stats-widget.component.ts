import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { StatsService } from '../../../../core/services/stats.service'; // Import the service
import { TranslateService, TranslateModule } from '@ngx-translate/core'; // Import TranslateService


@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CardModule, ChartModule, TabViewModule, TranslateModule], // Make sure TranslateModule is included here
  templateUrl: './stats-widget.component.html',
  styleUrls: ['./stats-widget.component.scss']
})
export class StatsWidgetComponent implements OnInit {
  public languageChartData: any;
  public skillsChartData: any;
  public experienceChartData: any;
  public chartOptions: any;
  public totalCandidates: number = 0;
  private languages: string[] = [];
  private skills: string[] = [];
  private experienceData: any[] = [];

  constructor(private statsService: StatsService, private translate: TranslateService) {}

  ngOnInit(): void {
    console.log('StatsWidgetComponent initialized');
    this.loadTotalCandidates();
    this.loadAllLanguages();
    this.loadAllSkills();
    this.loadExperienceData();
    this.initChartOptions();

    this.translate.onLangChange.subscribe(() => {
        // this.loadLanguagesChart();
        this.loadAllLanguages();
        // this.loadSkillsChart();
        this.loadAllSkills();
        this.loadExperienceChart();
    });
  }

  loadTotalCandidates(): void {
    this.statsService.getTotalCandidates().subscribe({
      next: (total) => {
        this.totalCandidates = total;
      },
      error: () => {
        this.totalCandidates = 0;
      }
    });
  }

  loadAllLanguages(): void {
    this.statsService.getLanguages().subscribe({
      next: (languages) => {
        this.languages = languages.length ? languages : [this.translate.instant('stats.noLanguages')];
        this.loadLanguagesChart();
      },
      error: () => {
        this.languages = [this.translate.instant('stats.noLanguages')];
        this.loadLanguagesChart();
      }
    });
  }

  loadAllSkills(): void {
    this.statsService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills.length ? skills : [this.translate.instant('stats.noSkills')];
        this.loadSkillsChart();
      },
      error: () => {
        this.skills = [this.translate.instant('stats.noSkills')];
        this.loadSkillsChart();
      }
    });
  }

  loadLanguagesChart(): void {
    if (!this.languages.length) return;

    Promise.all(
      this.languages.map(lang =>
        this.statsService.getCandidatesByLanguage(lang).toPromise()
          .then(candidates => candidates?.length || 0)
          .catch(() => 0)
      )
    ).then(counts => {
      this.languageChartData = {
        labels: this.languages,
        datasets: [{
          label: this.translate.instant('stats.candidatesByLanguage'),
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: counts[0] === 0 && this.languages[0] === this.translate.instant('stats.noLanguages') ? [0] : counts,
          borderWidth: 1
        }]
      };
    }).catch(() => {
      this.languageChartData = { labels: ['Error'], datasets: [{ data: [0] }] };
    });
  }

  loadSkillsChart(): void {
    if (!this.skills.length) return;

    Promise.all(
      this.skills.map(skill =>
        this.statsService.getCandidatesBySkill(skill).toPromise()
          .then(candidates => candidates?.length || 0)
          .catch(() => 0)
      )
    ).then(counts => {
      const isEmptyData = counts.every(count => count === 0) || this.skills[0] === this.translate.instant('stats.noSkills');
      this.skillsChartData = {
        labels: isEmptyData ? [this.translate.instant('stats.noData')] : this.skills,
        datasets: [{
          data: isEmptyData ? [1] : counts,
          backgroundColor: isEmptyData ? ['#E0E0E0'] : this.generateColors(counts.length),
          hoverBackgroundColor: isEmptyData ? ['#E0E0E0'] : this.generateColors(counts.length),
          borderWidth: 1,
          borderColor: isEmptyData ? '#d1d1d1' : '#ffffff'
        }]
      };
    }).catch(() => {
      this.skillsChartData = { labels: ['Error'], datasets: [{ data: [1] }] };
    });
  }

  initChartOptions(): void {
    this.chartOptions = {
      plugins: { legend: { labels: { color: '#495057' } }, tooltip: {} },
      scales: { y: { beginAtZero: true }, x: {} },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  loadExperienceData(): void {
    this.statsService.getExperienceDistribution().subscribe({
      next: (data) => {
        this.experienceData = (data as any).experienceDistribution || [];
        console.log('experienceData: ', this.experienceData);
        this.totalCandidates = (data as any).totalCandidates ?? 0;
        this.loadExperienceChart();
      },
      error: () => {
        this.experienceData = [];
        // this.loadExperienceChart();
      }
    });
  }

  loadExperienceChart(): void {
    const sorted = Object.entries(this.experienceData)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b));
    console.log('sorted: ', sorted);

    const labels = sorted.map(([label]) => label);
    console.log('labels: ', labels);
    const counts = sorted.map(([, count]) => count);
    console.log('counts: ', counts);

    // Define unique colors for each experience range
    const uniqueColors = [
      '#FF6F61', // 0 years
      '#6B5B95', // 1 year
      '#88B04B', // 2 years
      '#F7CAC9', // 3 years
      '#92A8D1', // 4 years
      '#955251', // 5 years
      '#B565A7', // 6 years
      '#009B77', // 7 years
      '#DD4124', // 8 years
      '#45B8AC', // 9 years
      '#EFC050', // 10+ years
    ];

    const backgroundColors = labels.map((_, index) => uniqueColors[index % uniqueColors.length]);
    const borderColors = backgroundColors.map(color => color); // Use same colors for borders

    this.experienceChartData = {
      labels,
      datasets: [{
        label: this.translate.instant('stats.candidatesByExperienceRange'),
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    console.log('experienceChartData: ', this.experienceChartData);
  }


  private generateColors(count: number): string[] {
    const colors = ['#42A5F5', '#66BB6A', '#FFCA28', '#EF5350'];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }
}
