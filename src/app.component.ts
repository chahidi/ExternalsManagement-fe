import { Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationModalService } from './app/core/services/utils/confirmation.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, TableModule, ConfirmDialogModule, ButtonModule],
    templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(
    private confirmationService: ConfirmationService,
    private confirmationModalService: ConfirmationModalService
  ) {}

  ngOnInit() {
    this.confirmationModalService.setConfirmationService(this.confirmationService);
  }
}
