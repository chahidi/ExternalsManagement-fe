import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,FormArray
} from '@angular/forms';
import { ActivatedRoute,Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MenuItem } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Candidate } from '../../../../core/models/candidate';
import { CandidateService } from '../../../../core/services/candidate.service';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    StepsModule,
    InputTextModule,
    InputTextarea,
    ButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
    DropdownModule,
    RadioButtonModule
  ],
  templateUrl: './stepper-form.component.html',
  styleUrls: ['./stepper-form.component.scss']
})
export class StepperFormComponent implements OnInit {
  steps: MenuItem[] = [];
  activeIndex: number = 0;
  extractedData: any;
  private destroy$ = new Subject<void>();


  languageLevels = [
    { label: 'Advanced', value: 'ADVANCED' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Basic', value: 'BASIC' },
    { label: 'Native', value: 'NATIVE' }
  ];

  skillProficiencies = [
    { label: 'Beginner', value: 'BEGINNER' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced', value: 'ADVANCED' },
    { label: 'Expert', value: 'EXPERT' }
  ];

  generalDataForm!: FormGroup;
  addressForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  languageForm!: FormGroup;
  skillsForm!: FormGroup;
  contactForm!: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute,
     private router: Router,
    private candidateService: CandidateService,
  ) {}

  ngOnInit() {
    this.steps = [
      { label: 'General Data' },
      { label: 'Address' },
      { label: 'Education' },
      { label: 'Experience' },
      { label: 'Languages' },
      { label: 'Skills' },
      { label: 'Contact' }
    ];

    // General Data Form
    this.generalDataForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.pattern('^[A-Za-z\\s]+$')]],
        birthDate: ['', [Validators.required, this.ageValidator]],
        yearsOfExperience: [
          null,
          [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)]
        ],
        gender: ['', Validators.required],
        mainTech: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9+#.\- ]+$/)]],
        summary: ['', Validators.required]
      },
      { validators: this.experienceAgeValidator }
    );

    this.addressForm = this.fb.group({
        street: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\-#.,'\/]+$/)]],
        postalCode: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\s-]{3,10}$')]],
        fullAddress: ['', Validators.required],
        city: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'.-]+$/)]],
        country: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'.-]+$/)]],
    });

   this.educationForm = this.fb.group({
      educations: this.fb.array([], Validators.required)
    });

    this.experienceForm = this.fb.group({
      experiences: this.fb.array([])
    });

    this.languageForm = this.fb.group({
      languages: this.fb.array([], Validators.required)
    });

    this.skillsForm = this.fb.group({
      skills: this.fb.array([], Validators.required)
    });

    this.contactForm = this.fb.group({
      contacts: this.fb.array([], Validators.required)
    });

    this.addEducation();
    this.addLanguage();
    this.addSkill();
    this.addContact();

    this.route.paramMap.subscribe(params => {
      const navigationData = history.state.extractedData;
      if (navigationData) {
        this.extractedData = navigationData;
        console.log('Extracted Data:', this.extractedData);
        this.populateForms();
      }
    });
  }

    get educations(): FormArray {
        return this.educationForm.get('educations') as FormArray;
    }

    get experiences(): FormArray {
        return this.experienceForm.get('experiences') as FormArray;
    }

    get languages(): FormArray {
        return this.languageForm.get('languages') as FormArray;
    }

    get skills(): FormArray {
        return this.skillsForm.get('skills') as FormArray;
    }

    get contacts(): FormArray {
        return this.contactForm.get('contacts') as FormArray;
    }

    createEducation(education?: any): FormGroup {
    return this.fb.group(
      {
        institution: [education?.institution || '', [Validators.required, Validators.pattern('^[A-Za-z0-9\\s\\-\\.\\&\\,\'\"]+$')]],
        startDate: [education?.startDate || '', [Validators.required, Validators.pattern('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')]],
        endDate: [education?.endDate || '', [Validators.required, Validators.pattern('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')]],
        diploma: [education?.diploma || '', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s,.\-'\+#&()]+$/)]]
      },
      { validators: this.dateRangeValidator }
    );
  }

  createExperience(experience?: any): FormGroup {
    return this.fb.group(
      {
        companyName: [experience?.companyName || '', Validators.pattern('^[A-Za-z0-9&\'’+.,\\-\\s]+$')],
        position: [experience?.position || '', Validators.pattern('^[A-Za-z\\s/-]+$')],
        startDate: [experience?.startDate || '', Validators.pattern('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')],
        endDate: [experience?.endDate || '', Validators.pattern('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')],
        description: [experience?.description || '', Validators.pattern('^[A-Za-z0-9\\s,.!?()\\-:;/\'"#\\n]+$')]
      },
      { validators: this.experienceDateValidator }
    );
  }

  createLanguage(language?: any): FormGroup {
    return this.fb.group({
      language: [language?.language || '', [Validators.required, Validators.pattern('^[A-Za-z\\s]+$')]],
      level: [language?.level || '', Validators.required],
      isNative: [language?.isNative || language?.description === 'Native' || false],
      description: [language?.description || ''],
      englishDescription: [language?.englishDescription || ''],
      languageInEnglish: [language?.languageInEnglish || '']
    });
  }

  createSkill(skill?: any): FormGroup {
    return this.fb.group({
      skillName: [skill?.skillName || '', Validators.required],
      proficiencyLevel: [skill?.proficiencyLevel || '', Validators.required]
    });
  }

  createContact(contact?: { contactType: string; contactValue: string }): FormGroup {
    const contactGroup = this.fb.group({
      contactType: [contact?.contactType || 'Email', Validators.required],
      contactValue: [contact?.contactValue || '', Validators.required]
    });

    contactGroup.get('contactType')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((type: string | null) => {
      const contactControl = contactGroup.get('contactValue');
      if (!contactControl) return;

      contactControl.clearValidators();

      if (type === 'Email') {
        contactControl.setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
        ]);
      } else if (type === 'Phone') {
        contactControl.setValidators([
          Validators.required,
          Validators.pattern(/^\+?\d{10,15}$/)
        ]);
      } else if (type === 'LinkedIn') {
        contactControl.setValidators([
          Validators.required,
          Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)
        ]);
      } else {
        contactControl.setValidators([Validators.required]);
      }

      contactControl.updateValueAndValidity();
    });

    const initialType = contact?.contactType || 'Email';
    contactGroup.get('contactType')?.setValue(initialType, { emitEvent: true });

    return contactGroup;
  }
   addEducation(education?: any): void {
    this.educations.push(this.createEducation(education));
  }

  addExperience(experience?: any): void {
    this.experiences.push(this.createExperience(experience));
  }

  addLanguage(language?: any): void {
    this.languages.push(this.createLanguage(language));
  }

  addSkill(skill?: any): void {
    this.skills.push(this.createSkill(skill));
  }

  addContact(contact?: { contactType: string; contactValue: string }): void {
    this.contacts.push(this.createContact(contact));
  }

  private populateForms() {
    if (!this.extractedData) return;

    this.generalDataForm.patchValue({
      fullName: this.extractedData.fullName || '',
      birthDate: this.extractedData.birthDate || '',
      yearsOfExperience: this.extractedData.yearsOfExperience || null,
      gender: this.extractedData.gender === 'M' ? 'Male' : this.extractedData.gender === 'F' ? 'Female' : '',
      mainTech: this.extractedData.mainTech || '',
      summary: this.extractedData.summary || ''
    });

    if (this.extractedData.address) {
      this.addressForm.patchValue({
        street: this.extractedData.address.street || '',
        postalCode: this.extractedData.address.postalCode || '',
        fullAddress: this.extractedData.address.fullAddress || '',
        city: this.extractedData.address.city?.name || this.extractedData.address.city || '',
        country: this.extractedData.address.country?.name || this.extractedData.address.country || ''
      });
    }
    if (this.extractedData.educations?.length) {
      this.educations.clear();
      this.extractedData.educations.forEach((edu: any) => this.addEducation(edu));
    }

    if (this.extractedData.experiences?.length) {
      this.experiences.clear();
      this.extractedData.experiences.forEach((exp: any) => this.addExperience(exp));
    }

    if (this.extractedData.naturalLanguages?.length || this.extractedData.languages?.length) {
      this.languages.clear();
      const langs = this.extractedData.naturalLanguages || this.extractedData.languages || [];
      langs.forEach((lang: any) => this.addLanguage(lang));
    }

    if (this.extractedData.skills?.length) {
      this.skills.clear();
      this.extractedData.skills.forEach((skill: any) => this.addSkill(skill));
    }

    if (this.extractedData.contacts?.length) {
      this.contacts.clear();
      this.extractedData.contacts.forEach((contact: { contactType: string; contactValue: string }) => {
        const contactType = contact.contactType
          ? contact.contactType.charAt(0).toUpperCase() + contact.contactType.slice(1).toLowerCase()
          : 'Email';
        this.addContact({
          contactType: ['Email', 'Phone', 'LinkedIn'].includes(contactType) ? contactType : 'LinkedIn',
          contactValue: contact.contactValue || ''
        });
      });
    }
  }

  // age validator

  ageValidator(control: AbstractControl): ValidationErrors | null {
    const birthDate = control.value;
    if (birthDate) {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      if (
        today.getMonth() < birthDateObj.getMonth() ||
        (today.getMonth() === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())
      ) {
        age--;
      }
      if (age < 18) return { underAge: true };
      if (age > 80) return { overAge: true };
    }
    return null;
  }
  // Custom validator for startDate < endDate
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Check if the start date is after the end date
      if (start > end) {
        return { invalidDateRange: true };
      }
    }
    return null;
  }
  // experince validator matches the age
  experienceAgeValidator(control: AbstractControl): ValidationErrors | null {
    const birthDateControl = control.get('birthDate');
    const yearsControl = control.get('yearsOfExperience');

    if (birthDateControl?.value && yearsControl?.value) {
      const birthDate = new Date(birthDateControl.value);
      const yearsOfExperience = parseInt(yearsControl.value, 10);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      const maxExperience = age - 16;
      if (yearsOfExperience > maxExperience) {
        return { invalidExperience: true };
      }
    }
    return null;
  }

  experienceDateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      if (start > end) {
        return { invalidDateRange: true };
      }
      if (end > now) {
        return { futureEndDate: true };
      }
    }
    return null;
  }

  getCurrentForm(): FormGroup {
    switch (this.activeIndex) {
      case 0:
        return this.generalDataForm;
      case 1:
        return this.addressForm;
      case 2:
        return this.educationForm;
      case 3:
        return this.experienceForm;
      case 4:
        return this.languageForm;
      case 5:
        return this.skillsForm;
      case 6:
        return this.contactForm;
      default:
        return this.generalDataForm;
    }
  }

  areAllFormsValid(): boolean {
    return [
      this.generalDataForm,
      this.addressForm,
      this.educationForm,
      this.experienceForm,
      this.languageForm,
      this.skillsForm,
      this.contactForm
    ].every(form => form.valid);
  }

  markAllFormsTouched(): void {
    [
      this.generalDataForm,
      this.addressForm,
      this.educationForm,
      this.experienceForm,
      this.languageForm,
      this.skillsForm,
      this.contactForm
    ].forEach(form => form.markAllAsTouched());
  }

  next(): void {
    const currentForm = this.getCurrentForm();
    if (currentForm.valid && this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
    } else {
      currentForm.markAllAsTouched();
    }
  }

  prev(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  clearCurrentSection(): void {
    this.getCurrentForm().reset();
  }

  onSubmit(): void {
    if (this.areAllFormsValid()) {
      const candidateData : Omit<Candidate, 'id'>= {
        fullName: this.generalDataForm.value.fullName,
        birthDate: this.generalDataForm.value.birthDate,
        gender: this.generalDataForm.value.gender === 'Male' ? 'M' : 'F',
        address: {
          ...this.addressForm.value,
          city: { name: this.addressForm.value.city },
          country: {
            name: this.addressForm.value.country,
            englishName: this.addressForm.value.country
           }
        },
        yearsOfExperience: this.generalDataForm.value.yearsOfExperience,
        mainTech: this.generalDataForm.value.mainTech,
        summary: this.generalDataForm.value.summary,
        educations: this.educations.value,
        experiences: this.experiences.value,
        naturalLanguages:this.languages.value,
        skills: this.skills.value,
        contacts: this.contacts.value,
      };

      console.log('Candidate Data: ', candidateData);
      this.candidateService.addCandidate(candidateData).subscribe({
        next:()=>{
            alert('Candidate added successfully');
            this.router.navigate(['/candidates/candidate-list']);
        },
        error:(err)=>{
            console.error('Error adding candidate:', err);
            alert('Failed to add the Candidate. Please try again.');
      }
      });
    } else {
      this.markAllFormsTouched();
    }
  }
}
