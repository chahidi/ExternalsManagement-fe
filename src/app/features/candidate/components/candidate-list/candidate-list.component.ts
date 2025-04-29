import { Component, OnInit } from '@angular/core';
import { CandidateService } from '../../../../core/services/candidate.service';
import { CandidateFilterService } from '../../../../core/services/candidate-filter.service';
import { Candidate } from '../../../../core/models/candidate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface FilterCriteria {
  skills: any[];
  language: any;
  yearsOfExperience: number | null;
}

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ProgressBarModule,
    DropdownModule,
    MultiSelectModule,
    SliderModule,
    InputNumberModule,
    ConfirmDialogModule,
    DialogModule,
    TextareaModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
})
export class CandidateListComponent implements OnInit {
  candidates: Candidate[] = [];
  loading: boolean = true;
  displayEditDialog: boolean = false;
  selectedCandidate: Candidate | null = null;

  skillOptions: any[] = [];
  languageOptions: any[] = [];

  filters: FilterCriteria = {
    skills: [],
    language: null,
    yearsOfExperience: null
  };

  constructor(
    private candidateService: CandidateService,
    private candidateFilterService: CandidateFilterService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
    this.loadFilterOptions();
  }

  loadFilterOptions(): void {
    this.skillOptions = [
      { name: 'JavaScript', code: 'JavaScript' },
      { name: 'Java', code: 'Java' },
      { name: 'Python', code: 'Python' },
      { name: 'Angular', code: 'Angular' },
      { name: 'React', code: 'React' },
      { name: 'Spring', code: 'Spring Boot' }
    ];

    this.languageOptions = [
      { name: 'English', code: 'English' },
      { name: 'French', code: 'French' },
      { name: 'Spanish', code: 'Spanish' },
      { name: 'German', code: 'German' },
      { name: 'Arabic', code: 'Arabic' }
    ];
  }

  loadCandidates(): void {
    this.loading = true;
    this.candidateService.getCandidates().subscribe({
      next: (data) => {
        this.candidates = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching candidates:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load candidates.'
        });
      },
    });
  }

  applyFilters(): void {
    this.loading = true;

    const filterParams: any = {};

    if (this.filters.skills && this.filters.skills.length > 0) {
      filterParams.skills = this.filters.skills.map(skill => skill.code).join(',');
    }

    if (this.filters.language) {
      filterParams.language = this.filters.language.code;
    }

    if (this.filters.yearsOfExperience !== null) {
      filterParams.yearsOfExperience = this.filters.yearsOfExperience;
    }

    this.candidateFilterService.filterCandidates(filterParams).subscribe({
      next: (data) => {
        this.candidates = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error filtering candidates:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to filter candidates.'
        });
      }
    });
  }

  resetFilters(): void {
    this.filters = {
      skills: [],
      language: null,
      yearsOfExperience: null
    };
    this.loadCandidates();
  }

  onFilterInput(event: Event, table: Table): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      table.filterGlobal(inputElement.value, 'contains');
    }
  }

  clear(table: Table): void {
    table.clear();
  }

  editCandidate(candidate: Candidate): void {
    this.selectedCandidate = JSON.parse(JSON.stringify(candidate));
    this.displayEditDialog = true;
  }

  saveCandidate(): void {
    if (!this.selectedCandidate) return;

    this.loading = true;
    this.candidateService.updateCandidate(this.selectedCandidate.id, this.selectedCandidate).subscribe({
      next: (updatedCandidate) => {
        const index = this.candidates.findIndex(c => c.id === updatedCandidate.id);
        if (index !== -1) {
          this.candidates[index] = updatedCandidate;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Candidate updated successfully'
        });

        this.displayEditDialog = false;
        this.selectedCandidate = null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating candidate:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update candidate.'
        });
        this.loading = false;
      }
    });
  }

  confirmDelete(candidate: Candidate): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${candidate.fullName}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteCandidate(candidate);
      }
    });
  }

  deleteCandidate(candidate: Candidate): void {
    this.loading = true;
    this.candidateService.deleteCandidate(candidate.id).subscribe({
      next: () => {
        this.candidates = this.candidates.filter(c => c.id !== candidate.id);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Candidate deleted successfully'
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Error deleting candidate:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete candidate.'
        });
        this.loading = false;
      }
    });
  }

  getPrimaryContact(contacts: any[], type: string): string {
    const contact = contacts?.find(c => c.contactType === type);
    return contact ? contact.contactValue : 'N/A';
  }
}
