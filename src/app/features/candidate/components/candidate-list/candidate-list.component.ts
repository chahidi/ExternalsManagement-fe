import { Component, OnInit } from '@angular/core';
import { CandidateService } from '../../../../core/services/candidate.service';
import { CandidateFilterService } from '../../../../core/services/candidate-filter.service';
import { Candidate } from '../../../../core/models/candidate';
import { Contact } from '../../../../core/models/contact';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { DatePicker } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { ConfirmationModalService } from '../../../../core/services/utils/confirmation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface FilterCriteria {
  skills: any[];
  language: any[];
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
    SelectModule,
    MultiSelectModule,
    SliderModule,
    InputNumberModule,
    ConfirmDialogModule,
    DialogModule,
    TextareaModule,
    ToastModule,
    DatePicker,
    CheckboxModule,
    LoaderComponent,
    TranslateModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
})
export class CandidateListComponent implements OnInit {
  candidates: Candidate[] = [];
  isLoading$!: any;
  loadingMessage$!: any;
  displayEditDialog: boolean = false;
  selectedCandidate: Candidate | null = null;

  skillOptions: any[] = [];
  languageOptions: any[] = [];
  proficiencyLevels: string[] = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
  proficiencyLevelOptions: DropdownOption[] = [];
  languageLevelOptions: DropdownOption[] = [];
  languageLevels: string[] = ['BEGINNER', 'LOWER_INTERMEDIATE', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED'];

  nameSortAsc: boolean = false;
  mainTechSortAsc: boolean = false;
  locationSortAsc: boolean = false;
  educationSortAsc: boolean = false;

  cities: any[] = [
    { id: '', name: 'Paris', country: null },
    { id: '', name: 'London', country: null },
    { id: '', name: 'New York', country: null }
  ];
  countries: any[] = [
    { id: '', name: 'France', englishName: 'France', cities: null },
    { id: '', name: 'UK', englishName: 'United Kingdom', cities: null },
    { id: '', name: 'USA', englishName: 'United State', cities: null }
  ];

  filters: FilterCriteria = {
    skills: [],
    language: [],
    yearsOfExperience: null,
  };

  newSkillName: string = '';
  newSkillProficiency: string = '';

  constructor(
    private candidateService: CandidateService,
    private candidateFilterService: CandidateFilterService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loaderService: LoaderService,
    private confirmationModalService: ConfirmationModalService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadCandidates();
    this.initFilterOptions();

    this.isLoading$ = this.loaderService.isLoading$;
    this.loadingMessage$ = this.loaderService.loadingMessage$;

    this.proficiencyLevelOptions = this.proficiencyLevels.map(level => ({
      label: this.translate.instant(`candidateList.proficiencyLevels.${level}`),
      value: level
    }));

    this.languageLevelOptions = this.languageLevels.map(lang => ({
      label: this.translate.instant(`candidateList.languageLevels.${lang}`),
      value: lang
    }));
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

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

  loadFilterOptions(): void {
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

    this.skillOptions = Array.from(uniqueSkills).sort().map(skill => ({
      name: skill,
      code: skill
    }));

    if (this.skillOptions.length === 0) {
      this.initFilterOptions();
    }

    const uniqueLanguages = new Set<string>();
    this.candidates.forEach(candidate => {
      if (candidate.naturalLanguages && candidate.naturalLanguages.length) {
        candidate.naturalLanguages.forEach(lang => {
          const languageName = lang.language || lang.languageInEnglish || lang.englishDescription;
          if (languageName) {
            uniqueLanguages.add(languageName);
          }
        });
      }
    });

    this.languageOptions = Array.from(uniqueLanguages).sort().map(language => ({
      name: language,
      code: language
    }));

    if (this.languageOptions.length === 0) {
      this.languageOptions = [
        { name: 'English', code: 'English' },
        { name: 'French', code: 'French' },
        { name: 'Spanish', code: 'Spanish' },
        { name: 'German', code: 'German' },
        { name: 'Arabic', code: 'Arabic' }
      ];
    }
  }

  loadCandidates(): void {
    this.loaderService.show(this.translate.instant('candidateList.loadingCandidates'));
    this.candidateService.getCandidates().subscribe({
      next: (data) => {
        this.candidates = data || [];
        this.loadFilterOptions();
        this.loaderService.hide();
      },
      error: (err) => {
        console.error('Error fetching candidates:', err);
        this.loaderService.hide();
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('candidateList.errors.error'),
          detail: err.message || this.translate.instant('candidateList.errors.loadFailed')
        });
      },
    });
  }

  applyFilters(): void {
    this.loaderService.show(this.translate.instant('candidateList.loadingCandidates'));

    const filterParams: any = {};
    if (this.filters.skills && this.filters.skills.length > 0) {
      filterParams.skills = [...this.filters.skills];
    }
    filterParams.language = [...this.filters.language];
    if (this.filters.yearsOfExperience !== null) {
      filterParams.yearsOfExperience = Number(this.filters.yearsOfExperience);
    }

    this.candidateFilterService.filterCandidates(filterParams).subscribe({
      next: (data) => {
        this.candidates = data || [];
        this.loaderService.hide();

        if (data.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: this.translate.instant('candidateList.filter.noResults'),
            detail: this.translate.instant('candidateList.filter.noCandidatesMatch')
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('candidateList.filter.filtersApplied'),
            detail: this.translate.instant('candidateList.filter.foundCandidates', { count: data.length })
          });
        }
      },
      error: (err) => {
        console.error('Error filtering candidates:', err);
        this.loaderService.hide();
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('candidateList.errors.error'),
          detail: this.translate.instant('candidateList.errors.filterFailed')
        });
      }
    });
  }

  resetFilters(): void {
    this.filters = {
      skills: [],
      language: [],
      yearsOfExperience: null,
    };
    this.loadCandidates();
    this.messageService.add({
      severity: 'info',
      summary: this.translate.instant('candidateList.filter.filtersReset'),
      detail: this.translate.instant('candidateList.filter.allFiltersCleared')
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
      summary: this.translate.instant('candidateList.table.tableCleared'),
      detail: this.translate.instant('candidateList.table.allFiltersCleared')
    });
  }

  editCandidate(candidate: Candidate): void {
    this.selectedCandidate = { ...candidate };
    this.selectedCandidate.addresses = this.selectedCandidate.addresses || [];
    this.selectedCandidate.contacts = this.selectedCandidate.contacts || [];
    this.selectedCandidate.experiences = this.selectedCandidate.experiences || [];
    this.selectedCandidate.skills = this.selectedCandidate.skills || [];
    this.selectedCandidate.educations = this.selectedCandidate.educations || [];
    this.selectedCandidate.naturalLanguages = this.selectedCandidate.naturalLanguages || [];
    this.selectedCandidate.addresses.forEach(addr => this.syncCityCountry(addr));
    this.displayEditDialog = true;
  }

  addAddress(): void {
    if (!this.selectedCandidate) return;
    const newAddress = {
      id: '',
      street: '',
      postalCode: '',
      fullAddress: '',
      city: this.cities[0],
      country: this.countries[0]
    };
    this.syncCityCountry(newAddress);
    this.selectedCandidate.addresses.push(newAddress);
  }

  removeAddress(index: number): void {
    if (this.selectedCandidate) {
      this.selectedCandidate.addresses.splice(index, 1);
    }
  }

  syncCityCountry(address: any): void {
    if (address.city && address.country) {
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

  confirmUpdate(): void {
    this.confirmationModalService.confirmUpdate(() => {
      this.saveCandidate();
    }, 'candidate');
  }

  saveCandidate(): void {
    if (!this.selectedCandidate) return;

    this.loaderService.show(this.translate.instant('candidateList.savingCandidate'));
    this.candidateService.updateCandidate(this.selectedCandidate.id, this.selectedCandidate).subscribe({
      next: (updatedCandidate) => {
        const index = this.candidates.findIndex(c => c.id === updatedCandidate.id);
        if (index !== -1) {
          this.candidates[index] = updatedCandidate;
        }

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('candidateList.messages.success'),
          detail: this.translate.instant('candidateList.messages.candidateUpdated')
        });

        this.displayEditDialog = false;
        this.selectedCandidate = null;
        this.loaderService.hide();
      },
      error: (err) => {
        console.error('Error updating candidate:', err);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('candidateList.errors.error'),
          detail: err.message || this.translate.instant('candidateList.errors.updateFailed')
        });
        this.loaderService.hide();
      }
    });
  }

  confirmDelete(candidate: Candidate): void {
    this.confirmationModalService.confirmDelete(() => {
      this.deleteCandidate(candidate);
    }, 'candidate');
  }

  deleteCandidate(candidate: Candidate): void {
    this.loaderService.show(this.translate.instant('candidateList.deletingCandidate'));
    this.candidateService.deleteCandidate(candidate.id).subscribe({
      next: () => {
        this.candidates = this.candidates.filter(c => c.id !== candidate.id);

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('candidateList.messages.success'),
          detail: this.translate.instant('candidateList.messages.candidateDeleted')
        });

        this.loaderService.hide();
      },
      error: (err) => {
        console.error('Error deleting candidate:', err);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('candidateList.errors.error'),
          detail: err.message || this.translate.instant('candidateList.errors.deleteFailed')
        });
        this.loaderService.hide();
      }
    });
  }

  getPrimaryContact(contacts: Contact[], type: string): string {
    const contact = contacts?.find(c => c.contactType === type);
    return contact ? contact.contactValue : 'N/A';
  }

  getProficiencyLabel(value: string): string {
    const proficiency = this.proficiencyLevelOptions.find(p => p.value === value);
    return proficiency ? proficiency.label : '';
  }

  getProficiencyClass(proficiency: string): string {
    switch (proficiency) {
      case 'BEGINNER': return 'beginner';
      case 'INTERMEDIATE': return 'intermediate';
      case 'ADVANCED': return 'advanced';
      case 'EXPERT': return 'expert';
      default: return '';
    }
  }

  addSkill() {
    if (this.newSkillName && this.newSkillProficiency) {
      if (!this.selectedCandidate) return;
      this.selectedCandidate.skills = this.selectedCandidate.skills || [];
      this.selectedCandidate.skills.push({
        id: '',
        skillName: this.newSkillName,
        proficiencyLevel: this.newSkillProficiency
      });
      this.newSkillName = '';
      this.newSkillProficiency = '';
    }
  }

  sortCandidatesByName() {
    this.nameSortAsc = !this.nameSortAsc;
    this.candidates.sort((a, b) =>
      this.nameSortAsc
        ? a.fullName.localeCompare(b.fullName)
        : b.fullName.localeCompare(a.fullName)
    );
  }

  sortCandidatesByMainTech() {
    this.mainTechSortAsc = !this.mainTechSortAsc;
    this.candidates.sort((a, b) =>
      this.mainTechSortAsc
        ? a.mainTech.localeCompare(b.mainTech)
        : b.mainTech.localeCompare(a.mainTech)
    );
  }

  sortCandidatesByLocation() {
    this.locationSortAsc = !this.locationSortAsc;

    this.candidates.sort((a, b) => {
      const aAddress = a.addresses && a.addresses.length > 0 ? a.addresses[0] : null;
      const bAddress = b.addresses && b.addresses.length > 0 ? b.addresses[0] : null;

      const aLocation = `${aAddress?.city?.name || ''}, ${aAddress?.country?.name || ''}`;
      const bLocation = `${bAddress?.city?.name || ''}, ${bAddress?.country?.name || ''}`;

      return this.locationSortAsc
        ? aLocation.localeCompare(bLocation)
        : bLocation.localeCompare(aLocation);
    });
  }

  sortCandidatesByEducation() {
    this.educationSortAsc = !this.educationSortAsc;

    this.candidates.sort((a, b) => {
      const aEducation = a.educations && a.educations.length > 0 ? a.educations[0] : null;
      const bEducation = b.educations && b.educations.length > 0 ? b.educations[0] : null;

      const aFormattedEducation = `${aEducation?.degree || ''}, ${aEducation?.institution || ''}`;
      const bFormattedEducation = `${bEducation?.degree || ''}, ${bEducation?.institution || ''}`;

      return this.educationSortAsc
        ? aFormattedEducation.localeCompare(bFormattedEducation)
        : bFormattedEducation.localeCompare(aFormattedEducation);
    });
  }
}
