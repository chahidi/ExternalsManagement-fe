import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { StatsService } from '../../../../core/services/stats.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CardModule, ChartModule, TabViewModule, CommonModule],
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
  private experienceData: any = {};

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    console.log('StatsWidgetComponent initialized');
    this.loadTotalCandidates();
    this.loadAllLanguages();
    this.loadAllSkills();
    this.loadExperienceData();
    this.initChartOptions();
  }

  loadTotalCandidates(): void {
    this.statsService.getTotalCandidates().subscribe({
      next: (total) => {
        console.log('Total candidates:', total);
        this.totalCandidates = total || 0;
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
        console.log('Languages loaded:', languages);
        this.languages = languages && languages.length ? languages : ['No Data'];
        this.loadLanguagesChart();
      },
      error: (err) => {
        console.error('Error loading languages:', err);
        this.languages = ['No Data'];
        this.loadLanguagesChart();
      }
    });
  }

  loadAllSkills(): void {
    this.statsService.getSkills().subscribe({
      next: (skills) => {
        console.log('Skills loaded:', skills);
        this.skills = skills && skills.length ? skills : ['No Data'];
        this.loadSkillsChart();
      },
      error: (err) => {
        console.error('Error loading skills:', err);
        this.skills = ['No Data'];
        this.loadSkillsChart();
      }
    });
  }

  loadLanguagesChart(): void {
    if (!this.languages.length) {
      this.createEmptyLanguageChart();
      return;
    }

    if (this.languages[0] === 'No Data') {
      this.createEmptyLanguageChart();
      return;
    }

    // Use forkJoin to handle multiple observables
    const requests = this.languages.map(lang =>
      this.statsService.getCandidatesByLanguage(lang).pipe(
        catchError(() => of(0))
      )
    );

    forkJoin(requests).subscribe({
      next: (counts) => {
        console.log('Language counts received:', counts);

        this.languageChartData = {
          labels: this.languages,
          datasets: [{
            label: 'Candidates by Language',
            backgroundColor: this.generateColors(counts.length),
            borderColor: '#1E88E5',
            data: counts,
            borderWidth: 1
          }]
        };
      },
      error: () => {
        this.createEmptyLanguageChart();
      }
    });
  }

  createEmptyLanguageChart(): void {
    this.languageChartData = {
      labels: ['No Data Available'],
      datasets: [{
        label: 'Candidates by Language',
        backgroundColor: '#E0E0E0',
        data: [0],
        borderWidth: 1
      }]
    };
  }

  loadSkillsChart(): void {
    if (!this.skills.length || this.skills[0] === 'No Data') {
      this.createEmptySkillsChart();
      return;
    }

    // Use forkJoin to handle multiple observables
    const requests = this.skills.map(skill =>
      this.statsService.getCandidatesBySkill(skill).pipe(
        catchError(() => of([]))
      )
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        const counts = responses.map(candidates => candidates?.length || 0);

        const isEmptyData = counts.every(count => count === 0);
        if (isEmptyData) {
          this.createEmptySkillsChart();
          return;
        }

        this.skillsChartData = {
          labels: this.skills,
          datasets: [{
            data: counts,
            backgroundColor: this.generateColors(counts.length),
            hoverBackgroundColor: this.generateColors(counts.length),
            borderWidth: 1
          }]
        };
      },
      error: () => {
        this.createEmptySkillsChart();
      }
    });
  }

  createEmptySkillsChart(): void {
    this.skillsChartData = {
      labels: ['No Data Available'],
      datasets: [{
        data: [1],
        backgroundColor: ['#E0E0E0'],
        hoverBackgroundColor: ['#E0E0E0'],
        borderWidth: 1
      }]
    };
  }

  initChartOptions(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: { color: '#495057' }
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#495057'
          }
        },
        x: {
          ticks: {
            color: '#495057'
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  loadExperienceData(): void {
    this.statsService.getExperienceDistribution().subscribe({
      next: (data) => {
        console.log('Experience data loaded:', data);
        this.experienceData = data.experienceDistribution || {};
        this.totalCandidates = data.totalCandidates || this.totalCandidates;
        this.loadExperienceChart();
      },
      error: (err) => {
        console.error('Error loading experience data:', err);
        this.experienceData = {};
        this.createEmptyExperienceChart();
      }
    });
  }

  loadExperienceChart(): void {
    // Check if data is empty
    if (!this.experienceData || Object.keys(this.experienceData).length === 0) {
      this.createEmptyExperienceChart();
      return;
    }

    try {
      const entries = Object.entries(this.experienceData);
      if (entries.length === 0) {
        this.createEmptyExperienceChart();
        return;
      }

      // Sort by numeric value of experience year
      const sorted = entries.sort((a, b) => {
        const aVal = a[0] === '10+' ? 11 : parseInt(a[0]);
        const bVal = b[0] === '10+' ? 11 : parseInt(b[0]);
        return aVal - bVal;
      });

      const labels = sorted.map(([label]) => label + (label !== '10+' ? ' years' : ' years'));
      const counts = sorted.map(([, count]) => count);

      // Define unique colors for each experience range
      const backgroundColors = this.generateColors(counts.length);

      this.experienceChartData = {
        labels,
        datasets: [{
          label: 'Candidates by experience',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1
        }]
      };

      console.log('Experience chart data:', this.experienceChartData);
    } catch (error) {
      console.error('Error creating experience chart:', error);
      this.createEmptyExperienceChart();
    }
  }

  createEmptyExperienceChart(): void {
    this.experienceChartData = {
      labels: ['No Experience Data'],
      datasets: [{
        label: 'Candidates by experience',
        data: [0],
        backgroundColor: ['#E0E0E0'],
        borderColor: ['#E0E0E0'],
        borderWidth: 1
      }]
    };
  }

  private generateColors(count: number): string[] {
    const colors = [
      '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1',
      '#955251', '#B565A7', '#009B77', '#DD4124', '#45B8AC', '#EFC050'
    ];

    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }
}
