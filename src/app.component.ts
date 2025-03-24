import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, TableModule],
    templateUrl: './app.component.html'
})
export class AppComponent {}
