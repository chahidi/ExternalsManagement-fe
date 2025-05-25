import { Component } from '@angular/core';
import { StatsWidgetComponent } from './component/statswidget/stats-widget.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsWidgetComponent, TranslateModule],
  template: `
    <div class="dashboard">
      <h1 class="dashboard-title">{{ 'menu.dashboard' | translate }}</h1>
      <app-stats-widget></app-stats-widget>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss'] // Point to the SCSS file
})
export class DashboardComponent { }
