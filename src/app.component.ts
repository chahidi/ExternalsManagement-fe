import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, TableModule],
    templateUrl: './app.component.html'
})
export class AppComponent {}
