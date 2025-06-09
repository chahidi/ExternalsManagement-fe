import { Component, OnInit } from '@angular/core';
import { CandidateService } from '../../../../core/services/candidate.service';
import { CandidateFilterService } from '../../../../core/services/candidate-filter.service';
import { Candidate } from '../../../../core/models/candidate';
import { Contact} from '../../../../core/models/contact';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
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
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';

interface FilterCriteria {
  skills: any[];
  language: any;
  yearsOfExperience: number | null;
}

interface DropdownOption {
  label: string;
  value: string;
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
    ToastModule,
    CalendarModule,
    CheckboxModule
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
  proficiencyLevels: string[] = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
  proficiencyLevelOptions: DropdownOption[] = [];
  languageLevelOptions: DropdownOption[] = [];
  languageLevels: string[] = ['BEGINNER', 'LOWER_INTERMEDIATE', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED' ];

  cities: any[] = [
    { id: '', name: 'Paris', country: null },
    { id: '', name: 'London', country: null },
    { id: '', name: 'New York', country: null }
  ];
  countries: any[] = [
    { id: '', name: 'France' , englishName:'France', cities :null},
    { id: '', name: 'UK', englishName:'United Kingdom', cities :null },
    { id: '', name: 'USA' ,  englishName:'United State', cities :null}
  ];

    filters: FilterCriteria = {
      skills: [],
      language: null,
      yearsOfExperience: null,
    };

  constructor(
    private candidateService: CandidateService,
    private candidateFilterService: CandidateFilterService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
    this.initFilterOptions();

    this.proficiencyLevelOptions = this.proficiencyLevels.map(level => ({
      label: level,
      value: level
    }));
    this.languageLevelOptions = this.languageLevels.map(lang => ({
        label :lang,
        value: lang
      }));
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  // Initialize with default values but will be updated with real data after loading candidates
  initFilterOptions(): void {
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

  // Updated method to extract available skills and languages from the loaded candidates
  loadFilterOptions(): void {
    // Extract unique skills from candidates
    const uniqueSkills = new Set<string>();
    this.candidates.forEach(candidate => {
      if (candidate.skills && candidate.skills.length) {
        candidate.skills.forEach(skill => {
          if (skill.skillName) {
            uniqueSkills.add(skill.skillName);
          }
        });
      }
    });

    // Create skill options
    this.skillOptions = Array.from(uniqueSkills).sort().map(skill => ({
      name: skill,
      code: skill
    }));

    if (this.skillOptions.length === 0) {
      // If no skills found, use default options
      this.initFilterOptions();
    } else {
      console.log('Loaded actual skills from candidates:', this.skillOptions);
    }

    // Extract unique languages from candidates
    const uniqueLanguages = new Set<string>();
    this.candidates.forEach(candidate => {
      if (candidate.naturalLanguages && candidate.naturalLanguages.length) {
        candidate.naturalLanguages.forEach(lang => {
          // Prioritize language field but fall back to others if needed
          const languageName = lang.language || lang.languageInEnglish || lang.englishDescription;
          if (languageName) {
            uniqueLanguages.add(languageName);
          }
        });
      }
    });

    // Create language options
    this.languageOptions = Array.from(uniqueLanguages).sort().map(language => ({
      name: language,
      code: language
    }));

    if (this.languageOptions.length === 0) {
      // If no languages found, keep default options
      console.log('No languages found in candidates, using defaults');
      this.languageOptions = [
        { name: 'English', code: 'English' },
        { name: 'French', code: 'French' },
        { name: 'Spanish', code: 'Spanish' },
        { name: 'German', code: 'German' },
        { name: 'Arabic', code: 'Arabic' }
      ];
    } else {
      console.log('Loaded actual languages from candidates:', this.languageOptions);
    }

    console.log('Available skills:', this.skillOptions);
    console.log('Available languages:', this.languageOptions);
  }

  loadCandidates(): void {
    this.loading = true;
    this.candidateService.getCandidates().subscribe({
      next: (data) => {
        this.candidates = data || [];
        console.log('Loaded candidates:', this.candidates.length);
        // Log a sample candidate to check its structure
        if (this.candidates.length > 0) {
          console.log('Sample candidate:', this.candidates[0]);
        }

        // Load filter options based on real candidate data
        this.loadFilterOptions();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching candidates:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to load candidates.'
        });
      },
    });
  }

  applyFilters(): void {
    this.loading = true;
    console.log('Applying filters:', this.filters);

    // Check if filters contain the expected data structure
    if (this.filters.skills && this.filters.skills.length > 0) {
      console.log('Skills filter:', this.filters.skills);
      this.filters.skills.forEach((skill: any, index: number) => {
        console.log(`Skill ${index}:`, skill.name, skill.code);
      });
    }

    if (this.filters.language) {
      console.log('Language filter:', this.filters.language.name, this.filters.language.code);
    }

    if (this.filters.yearsOfExperience !== null) {
      console.log('Years of experience filter:', this.filters.yearsOfExperience);
    }

    const filterParams: any = {};

    // Clone the filters to ensure we're passing the complete objects
    if (this.filters.skills && this.filters.skills.length > 0) {
      filterParams.skills = [...this.filters.skills];
    }

    if (this.filters.language) {
      filterParams.language = {...this.filters.language};
    }

    if (this.filters.yearsOfExperience !== null) {
      // Ensure we're passing a number value for years of experience
      filterParams.yearsOfExperience = Number(this.filters.yearsOfExperience);
    }

    this.candidateFilterService.filterCandidates(filterParams).subscribe({
      next: (data) => {
        console.log('Filtered candidates:', data.length);
        this.candidates = data || [];
        this.loading = false;

        if (data.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'No Results',
            detail: 'No candidates match the selected filters.'
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Filters Applied',
            detail: `Found ${data.length} candidates matching your criteria.`
          });
        }
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
      yearsOfExperience: null,
    };
    this.loadCandidates();
    this.messageService.add({
      severity: 'info',
      summary: 'Filters Reset',
      detail: 'All filters have been cleared.'
    });
  }

  onFilterInput(event: Event, table: Table): void {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  clear(table: Table): void {
    table.clear();
    this.messageService.add({
      severity: 'info',
      summary: 'Table Cleared',
      detail: 'All table filters have been cleared.'
    });
  }

  editCandidate(candidate: Candidate): void {this.selectedCandidate = { ...candidate };
  this.selectedCandidate.addresses = this.selectedCandidate.addresses || [];
  this.selectedCandidate.contacts = this.selectedCandidate.contacts || [];
  this.selectedCandidate.experiences = this.selectedCandidate.experiences || [];
  this.selectedCandidate.skills = this.selectedCandidate.skills || [];
  this.selectedCandidate.educations = this.selectedCandidate.educations || [];
  this.selectedCandidate.naturalLanguages = this.selectedCandidate.naturalLanguages || [];
  // Synchroniser city.country pour les adresses existantes
  this.selectedCandidate.addresses.forEach(addr => this.syncCityCountry(addr));
  this.displayEditDialog = true;
}
addAddress(): void {
    console.log('Adding new address');
    if (!this.selectedCandidate) return;
    const newAddress = {
      id: '',
      street: '',
      postalCode: '',
      fullAddress: '',
      city: this.cities[0], // Valeur par défaut : première ville
      country: this.countries[0] // Valeur par défaut : premier pays
    };
    this.syncCityCountry(newAddress); // Synchroniser city.country
    this.selectedCandidate.addresses.push(newAddress);
  }

  removeAddress(index: number): void {
    if (this.selectedCandidate) {
      this.selectedCandidate.addresses.splice(index, 1);
    }
  }

  syncCityCountry(address: any): void {
    if (address.city && address.country) {
      // S'assurer que city.country correspond à address.country
      address.city = {
        ...address.city,
        country: address.country,
        countryId: address.country.id
      };
    }
  }

  onCityChange(address: any): void {
    if (address.city) {
      const selectedCity = this.cities.find(city => city.id === address.city.id);
      if (selectedCity) {
        const correspondingCountry = this.countries.find(country => country.id === selectedCity.countryId);
        if (correspondingCountry) {
          address.country = correspondingCountry;
          this.syncCityCountry(address);
        }
      }
    }
  }

  onCountryChange(address: any): void {
    if (address.country && address.city) {
      this.syncCityCountry(address);
    }
  }

  addContact(): void {
    if (!this.selectedCandidate) return;
    this.selectedCandidate.contacts = this.selectedCandidate.contacts || [];
    this.selectedCandidate.contacts.push({
      id: '',
      candidateId: this.selectedCandidate.id,
      contactType: '',
      contactValue: ''
    });
  }

  removeContact(index: number): void {
    if (!this.selectedCandidate || !this.selectedCandidate.contacts) return;
    this.selectedCandidate.contacts.splice(index, 1);
  }

  addExperience(): void {
    if (!this.selectedCandidate) return;
    this.selectedCandidate.experiences = this.selectedCandidate.experiences || [];
    this.selectedCandidate.experiences.push({
      id: '',
      candidateId: this.selectedCandidate.id,
      companyName: '',
      position: '',
      startDate: '',
      endDate: null,
      description: ''
    });
  }

  removeExperience(index: number): void {
    if (!this.selectedCandidate || !this.selectedCandidate.experiences) return;
    this.selectedCandidate.experiences.splice(index, 1);
  }

  addSkill(): void {
    if (!this.selectedCandidate) return;
    this.selectedCandidate.skills = this.selectedCandidate.skills || [];
    this.selectedCandidate.skills.push({
      id: '',
      skillName: '',
      proficiencyLevel: 'BEGINNER',
    });
  }

  removeSkill(index: number): void {
    if (!this.selectedCandidate || !this.selectedCandidate.skills) return;
    this.selectedCandidate.skills.splice(index, 1);
  }

  addEducation(): void {
    if (!this.selectedCandidate) return;
    this.selectedCandidate.educations = this.selectedCandidate.educations || [];
    this.selectedCandidate.educations.push({
      id: '',
      candidate: this.selectedCandidate,
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      diploma: ''
    });
  }

  removeEducation(index: number): void {
    if (!this.selectedCandidate || !this.selectedCandidate.educations) return;
    this.selectedCandidate.educations.splice(index, 1);
  }

  addLanguage(): void {
    if (!this.selectedCandidate) return;
    this.selectedCandidate.naturalLanguages = this.selectedCandidate.naturalLanguages || [];
    this.selectedCandidate.naturalLanguages.push({
      id: '',
      candidate: this.selectedCandidate,
      description: '',
      englishDescription: '',
      fullDescription: '',
      language: '',
      languageInEnglish: '',
      level: 'BEGINNER',
      isNative: false
    });
  }

  removeLanguage(index: number): void {
    if (!this.selectedCandidate || !this.selectedCandidate.naturalLanguages) return;
    this.selectedCandidate.naturalLanguages.splice(index, 1);
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
          detail: err.message || 'Failed to update candidate.'
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
          detail: err.message || 'Failed to delete candidate.'
        });
        this.loading = false;
      }
    });
  }

  getPrimaryContact(contacts: Contact[], type: string): string {
    const contact = contacts?.find(c => c.contactType === type);
    return contact ? contact.contactValue : 'N/A';
  }
}
