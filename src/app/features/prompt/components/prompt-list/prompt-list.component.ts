import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PromptService } from '../../../../core/services/prompt.service';
import { Prompt } from '../../../../core/models/prompt';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';


@Component({
  selector: 'app-prompt-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule
],
  templateUrl: './prompt-list.component.html',
  styleUrl: './prompt-list.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class PromptListComponent implements OnInit {
  prompts: Prompt[] = [];
  totalRecords = 0;
  loading = false;
  first = 0;
  rows = 5;
  sortField = '';
  sortOrder = 1;

  dialogVisible = false;
  selectedPrompt: Prompt = { id: '', promptCode: '', promptDesc: '', schema: '' };

  constructor(
    private promptService: PromptService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
) {}

  ngOnInit() {
    this.loadPrompts();
  }

  loadPrompts(event?: any) {
    this.loading = true;
    const page = event ? event.first / event.rows : 0;
    const size = event ? event.rows : this.rows;
    const sortField = event ? event.sortField : this.sortField;
    const sortOrder = event ? event.sortOrder : this.sortOrder;

    this.promptService.getAllPromptsPaginated(page, size, sortField, sortOrder).subscribe({
      next: (data) => {
        this.prompts = data.content;
        this.totalRecords = data.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        this.loading = false;
      },
    });
  }

  confirmDelete(id: string) {
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this prompt?',
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
        this.deletePrompt(id);
        }
    });
    }

  deletePrompt(id: string) {
    this.promptService.deletePrompt(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Prompt deleted successfully' });
        this.loadPrompts();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      },
    });
  }

  showUpdateDialog(prompt: Prompt) {
    this.selectedPrompt = { ...prompt };
    this.dialogVisible = true;
  }

  updatePrompt() {
    this.promptService.updatePrompt(this.selectedPrompt.id, this.selectedPrompt).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Prompt updated successfully' });
        this.dialogVisible = false;
        this.loadPrompts();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      },
    });
  }
}
