import { Component, OnInit, ViewChild } from '@angular/core';
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
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { ConfirmationModalService } from '../../../../core/services/utils/confirmation.service';
import { PromptFilterService } from '../../../../core/services/prompt-filter.service';
import { Table } from 'primeng/table';


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
    ConfirmDialogModule,
    LoaderComponent
],
  templateUrl: './prompt-list.component.html',
  styleUrl: './prompt-list.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class PromptListComponent implements OnInit {
  @ViewChild('dt1') dt1!: Table;

  prompts: Prompt[] = [];
  filteredPrompts: Prompt[] = [];
  totalRecords = 0;
  loading = false;
  first = 0;
  rows = 5;
  sortField = '';
  sortOrder = 1;

  // Search functionality
  searchQuery = '';

  dialogVisible = false;
  selectedPrompt: Prompt = { id: '', promptCode: '', promptDesc: '', schema: '' };

  // View dialogs for full text/schema
  descDialogVisibleText = false;
  descDialogVisibleSchema = false;
  currentPrompt: Prompt | null = null;

  isLoading$!: any;
  loadingMessage$!: any;

  constructor(
    private promptService: PromptService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loaderService: LoaderService,
    private confirmationModalService: ConfirmationModalService,
    private promptFilterService: PromptFilterService
) {}

  ngOnInit() {
    this.loadPrompts();

    this.isLoading$ = this.loaderService.isLoading$;
    this.loadingMessage$ = this.loaderService.loadingMessage$;
  }

  loadPrompts(event?: any) {
    this.loaderService.show("Loading prompts...");
    const page = event ? event.first / event.rows : 0;
    const size = event ? event.rows : this.rows;
    const sortField = event ? event.sortField : this.sortField;
    const sortOrder = event ? event.sortOrder : this.sortOrder;

    this.promptService.getAllPromptsPaginated(page, size, sortField, sortOrder).subscribe({
      next: (data) => {
        this.prompts = data.content;
        this.filteredPrompts = this.prompts;
        this.totalRecords = data.totalElements;
        this.loaderService.hide();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        this.loaderService.hide();
      },
    });
  }

  onSearch() {
    this.filteredPrompts = this.promptFilterService.searchPrompts(this.prompts, this.searchQuery);
  }

  clear(dt: Table) {
    this.searchQuery = '';
    this.filteredPrompts = this.prompts;

    if (dt && (dt as any).clear) {
      (dt as any).clear();
    }

    this.messageService.add({ severity: 'info', summary: 'Clear', detail: 'The search is cleared!' });
  }

  openTextModal(prompt: Prompt) {
    this.currentPrompt = prompt;
    this.descDialogVisibleText = true;
  }

  openSchemaModal(prompt: Prompt) {
    this.currentPrompt = prompt;
    this.descDialogVisibleSchema = true;
  }

  teaserWords(source: string | null | undefined, maxWords: number = 5): string {
    if (!source) return '';
    const words = source.trim().split(/\s+/);
    if (words.length <= maxWords) return source;
    return words.slice(0, maxWords).join(' ') + '…';
  }

  confirmDelete(id: string) {
    this.confirmationModalService.confirmDelete(() => {
      this.deletePrompt(id);
    }, 'prompt');
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

  confirmUpdate(): void {
    this.confirmationModalService.confirmUpdate(() => {
      this.updatePrompt();
    }, 'prompt');
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
