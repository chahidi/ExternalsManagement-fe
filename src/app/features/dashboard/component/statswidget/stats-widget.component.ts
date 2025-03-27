import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { StatsService } from '../../../../core/services/stats.service'; // Import the service

@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CardModule, ChartModule, TabViewModule],
  templateUrl: './stats-widget.component.html',
  styleUrls: ['./stats-widget.component.scss']
})
export class StatsWidgetComponent implements OnInit {
  public languageChartData: any;
  public skillsChartData: any;
  public chartOptions: any;
  public totalCandidates: number = 0;
  private languages: string[] = [];
  private skills: string[] = [];

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    console.log('StatsWidgetComponent initialized');
    this.loadTotalCandidates();
    this.loadAllLanguages();
    this.loadAllSkills();
    this.initChartOptions();
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
        this.languages = languages.length ? languages : ['No Languages'];
        this.loadLanguagesChart();
      },
      error: () => {
        this.languages = ['No Languages'];
        this.loadLanguagesChart();
      }
    });
  }

  loadAllSkills(): void {
    this.statsService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills.length ? skills : ['No Skills'];
        this.loadSkillsChart();
      },
      error: () => {
        this.skills = ['No Skills'];
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
          label: 'Candidates by Language',
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: counts[0] === 0 && this.languages[0] === 'No Languages' ? [0] : counts,
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
      const isEmptyData = counts.every(count => count === 0) || this.skills[0] === 'No Skills';
      this.skillsChartData = {
        labels: isEmptyData ? ['No Data'] : this.skills,
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

  private generateColors(count: number): string[] {
    const colors = ['#42A5F5', '#66BB6A', '#FFCA28', '#EF5350'];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }
}
