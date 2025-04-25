import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { StatsService } from '../../../../core/services/stats.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
      error: (err) => {
        console.error('Error loading total candidates:', err);
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
      error: (err) => {
        console.error('Error loading languages:', err);
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
      error: (err) => {
        console.error('Error loading skills:', err);
        this.skills = ['No Skills'];
        this.loadSkillsChart();
      }
    });
  }

  loadLanguagesChart(): void {
    if (!this.languages.length) return;

    // Create an array of observables for each language
    const requests = this.languages.map(lang => 
      this.statsService.getCandidatesByLanguage(lang).pipe(
        catchError(err => {
          console.error(`Error fetching candidates for language ${lang}:`, err);
          return of([]);
        })
      )
    );

    // Execute all requests in parallel
    forkJoin(requests).subscribe({
      next: (responses) => {
        const counts = responses.map(candidates => candidates?.length || 0);
        
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
      },
      error: (err) => {
        console.error('Error in forkJoin for languages:', err);
        this.languageChartData = { 
          labels: ['Error'], 
          datasets: [{ 
            label: 'Error loading data',
            data: [0],
            backgroundColor: '#EF5350' 
          }] 
        };
      }
    });
  }

  loadSkillsChart(): void {
    if (!this.skills.length) return;

    // Create an array of observables for each skill
    const requests = this.skills.map(skill => 
      this.statsService.getCandidatesBySkill(skill).pipe(
        catchError(err => {
          console.error(`Error fetching candidates for skill ${skill}:`, err);
          return of([]);
        })
      )
    );

    // Execute all requests in parallel
    forkJoin(requests).subscribe({
      next: (responses) => {
        const counts = responses.map(candidates => candidates?.length || 0);
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
      },
      error: (err) => {
        console.error('Error in forkJoin for skills:', err);
        this.skillsChartData = { 
          labels: ['Error'], 
          datasets: [{ 
            data: [1],
            backgroundColor: ['#EF5350'],
            hoverBackgroundColor: ['#EF5350'],
            borderWidth: 1
          }] 
        };
      }
    });
  }

  initChartOptions(): void {
    this.chartOptions = {
      plugins: { 
        legend: { 
          labels: { color: '#495057' } 
        }, 
        tooltip: {} 
      },
      scales: { 
        y: { beginAtZero: true }, 
        x: {} 
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  private generateColors(count: number): string[] {
    const colors = ['#42A5F5', '#66BB6A', '#FFCA28', '#EF5350', '#AB47BC', '#EC407A', '#7E57C2', '#26A69A'];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }
}