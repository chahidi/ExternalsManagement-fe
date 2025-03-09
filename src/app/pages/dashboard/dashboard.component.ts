import { Component } from '@angular/core';
import { StatsWidgetComponent } from './component/statswidget/stats-widget.component';


@Component({
    selector: 'app-dashboard',
    imports: [StatsWidgetComponent],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent {}
