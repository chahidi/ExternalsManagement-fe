import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CardModule, ChartModule, TabViewModule],
  templateUrl: './stats-widget.component.html',
  styleUrls: ['./stats-widget.component.scss']
})
export class StatsWidgetComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/candidates/charts';
  public languageChartData: any = {
    labels: ['Loading...'],
    datasets: [{
      label: 'Candidates by Language',
      backgroundColor: '#42A5F5',
      borderColor: '#1E88E5',
      data: [0],
      borderWidth: 1
    }]
  };
  public skillsChartData: any = {
    labels: ['Loading...'],
    datasets: [{
      data: [1],
      backgroundColor: ['#E0E0E0'],
      hoverBackgroundColor: ['#E0E0E0'],
      borderWidth: 1,
      borderColor: '#d1d1d1'
    }]
  };
  public chartOptions: any;
  public totalCandidates: number = 0;
  private languages: string[] = [];
  private skills: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('StatsWidgetComponent initialized');
    // Restore API calls to fetch data from the database
    this.loadTotalCandidates();
    this.loadAllLanguages();
    this.loadAllSkills();
    this.initChartOptions();
  }

  loadTotalCandidates(): void {
    console.log('Loading total candidates...');
    this.http.get<number>(`${this.apiUrl}/candidates/total`).subscribe({
      next: (total) => {
        this.totalCandidates = total;
        console.log('Total candidates loaded:', total);
      },
      error: (err) => {
        console.error('Error loading total candidates:', err);
        this.totalCandidates = 0;
      }
    });
  }

  loadAllLanguages(): void {
    console.log('Loading languages...');
    this.http.get<string[]>(`${this.apiUrl}/languages`).subscribe({
      next: (languages) => {
        this.languages = languages.length ? languages : ['No Languages'];
        console.log('Languages loaded:', this.languages);
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
    console.log('Loading skills...');
    this.http.get<string[]>(`${this.apiUrl}/technologies`).subscribe({
      next: (skills) => {
        this.skills = skills.length ? skills : ['No Skills'];
        console.log('Skills loaded:', this.skills);
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

    console.log('Loading language chart data for:', this.languages);
    Promise.all(
      this.languages.map(lang => 
        this.http.get<any[]>(`${this.apiUrl}/candidates/language/${lang}`).toPromise()
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
      console.log('Language chart data loaded:', this.languageChartData);
    }).catch(err => {
      console.error('Error loading language chart data:', err);
      this.languageChartData = {
        labels: ['Error'],
        datasets: [{
          label: 'Candidates by Language',
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: [0],
          borderWidth: 1
        }]
      };
    });
  }

  loadSkillsChart(): void {
    if (!this.skills.length) return;

    console.log('Loading skills chart data for:', this.skills);
    Promise.all(
      this.skills.map(skill => 
        this.http.get<any[]>(`${this.apiUrl}/candidates/technology/${skill}`).toPromise()
          .then(candidates => candidates?.length || 0)
          .catch(() => 0)
      )
    ).then(counts => {
      const isEmptyData = counts.every(count => count === 0) || this.skills[0] === 'No Skills';
      this.skillsChartData = {
        labels: isEmptyData ? ['No Data'] : this.skills,
        datasets: [{
          data: isEmptyData ? [1] : counts,
          backgroundColor: isEmptyData 
            ? ['#E0E0E0'] 
            : this.generateColors(counts.length),
          hoverBackgroundColor: isEmptyData 
            ? ['#E0E0E0'] 
            : this.generateColors(counts.length),
          borderWidth: 1,
          borderColor: isEmptyData ? '#d1d1d1' : '#ffffff'
        }]
      };
      console.log('Skills chart data loaded:', this.skillsChartData);
    }).catch(err => {
      console.error('Error loading skills chart data:', err);
      this.skillsChartData = {
        labels: ['Error'],
        datasets: [{ 
          data: [1], 
          backgroundColor: ['#E0E0E0'], 
          hoverBackgroundColor: ['#E0E0E0'],
          borderWidth: 1,
          borderColor: '#d1d1d1'
        }]
      };
    });
  }

  initChartOptions(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 10
          },
          position: 'top'
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          titleFont: {
            size: 12,
            weight: '500'
          },
          bodyFont: {
            size: 11
          },
          padding: 8,
          cornerRadius: 4
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#495057',
            font: {
              size: 11
            },
            padding: 5
          },
          grid: {
            color: '#ebedef',
            drawBorder: false
          },
          title: {
            display: true,
            text: 'Number of Candidates',
            color: '#495057',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 5
          }
        },
        x: {
          ticks: {
            color: '#495057',
            font: {
              size: 11
            },
            padding: 5
          },
          grid: {
            display: false
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
    console.log('Chart options initialized:', this.chartOptions);
  }

  private generateColors(count: number): string[] {
    const colors = [
      '#42A5F5', '#66BB6A', '#FFCA28', '#EF5350', '#AB47BC',
      '#26C6DA', '#D4E157', '#FF7043', '#8D6E63', '#B0BEC5'
    ];
    return Array.from(
      { length: count }, 
      (_, i) => colors[i % colors.length]
    );
  }
}