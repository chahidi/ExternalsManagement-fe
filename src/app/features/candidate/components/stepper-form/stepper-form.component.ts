import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MenuItem } from 'primeng/api';

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

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {}

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
        institution: ['', [
          Validators.required,
          Validators.pattern('^[A-Za-z0-9\\s\\-\\.\\&\\,\'\"]+$')
        ]],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        diploma: ['', [
            Validators.required,
            Validators.pattern(/^[A-Za-z0-9\s,.\-'\+#&()]+$/)
          ]]
      },
      { validators: this.dateRangeValidator } );

    this.experienceForm = this.fb.group(
        {
          companyName: ['', Validators.pattern("^[A-Za-z0-9&'’+.,\\-\\s]+$")],
          position: ['',  Validators.pattern('^[A-Za-z\\s/-]+$')],
          startDate: ['', Validators.pattern('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')],
          endDate: ['', Validators.pattern('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')],
          description: ['', Validators.pattern('^[A-Za-z0-9\\s,.!?()\\-:;/\'"#\\n]+$')]
        },
        { validators: this.experienceDateValidator }
      );

    // validator for language
    this.languageForm = this.fb.group({
      language: ['', [Validators.required, Validators.pattern('^[A-Za-z\\s]+$')]],
      level: ['', Validators.required],
      isNative: [false]
    });

    this.skillsForm = this.fb.group({
      skillName: ['', Validators.required],
      proficiencyLevel: ['', Validators.required]
    });

    this.contactForm = this.fb.group({
      contactType: ['Email', Validators.required],
      contactValue: ['', [Validators.required,]]
    });

    this.contactForm.get('contactType')?.valueChanges.subscribe((type: string) => {
        const contactControl = this.contactForm.get('contactValue');
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

    this.route.paramMap.subscribe(params => {
      const navigationData = history.state.extractedData;
      if (navigationData) {
        this.extractedData = navigationData;
        console.log('Extracted Data:', this.extractedData);
        this.populateForms();
      }
    });
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

    if (this.extractedData.educations && this.extractedData.educations.length > 0) {
      this.educationForm.patchValue({
        institution: this.extractedData.educations[0].institution || '',
        degree: this.extractedData.educations[0].degree || this.extractedData.educations[0].diploma || '',
        startDate: this.extractedData.educations[0].startDate || '',
        endDate: this.extractedData.educations[0].endDate || '',
        diploma: this.extractedData.educations[0].diploma || ''
      });
    }

        const experience = this.extractedData.experiences?.[0] || {};
    this.experienceForm.patchValue({
    companyName: experience.companyName || '',
    position: experience.position || '',
    startDate: experience.startDate || '',
    endDate: experience.endDate || '',
    description: experience.description || ''
    });

    // ;anguage map
    if (this.extractedData.naturalLanguages && this.extractedData.naturalLanguages.length > 0) {
      this.languageForm.patchValue({
        language: this.extractedData.naturalLanguages[0].language || '',
        level: this.extractedData.naturalLanguages[0].level || '',
        isNative: this.extractedData.naturalLanguages[0].isNative || this.extractedData.naturalLanguages[0].description === 'Native' || false
      });
    } else if (this.extractedData.languages && this.extractedData.languages.length > 0) {
      this.languageForm.patchValue({
        language: this.extractedData.languages[0].language || '',
        level: this.extractedData.languages[0].level || '',
        isNative: this.extractedData.languages[0].isNative || false
      });
    }

    if (this.extractedData.skills && this.extractedData.skills.length > 0) {
      this.skillsForm.patchValue({
        skillName: this.extractedData.skills[0].skillName || '',
        proficiencyLevel: this.extractedData.skills[0].proficiencyLevel || ''
      });
    }

    if (this.extractedData.contacts && this.extractedData.contacts.length > 0) {
      const contactType = this.extractedData.contacts[0].contactType
        ? this.extractedData.contacts[0].contactType.charAt(0).toUpperCase() + this.extractedData.contacts[0].contactType.slice(1).toLowerCase()
        : 'Email';
      this.contactForm.patchValue({
        contactType: ['Email', 'Phone', 'LinkedIn'].includes(contactType) ? contactType : 'Email',
        contactValue: this.extractedData.contacts[0].contactValue || ''
      });
      // Trigger the validators after patching the values
        this.contactForm.get('contactValue')?.updateValueAndValidity();
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

      console.log('Start Date:', start);
      console.log('End Date:', end);

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
      const candidateData = {
        fullName: this.generalDataForm.value.fullName,
        birthDate: this.generalDataForm.value.birthDate,
        yearsOfExperience: this.generalDataForm.value.yearsOfExperience,
        gender: this.generalDataForm.value.gender,
        mainTech: this.generalDataForm.value.mainTech,
        summary: this.generalDataForm.value.summary,
        address: this.addressForm.value,
        educations: [this.educationForm.value],
        experiences: this.experienceForm.valid && this.experienceForm.value.companyName ? [this.experienceForm.value] : [],
        languages: [this.languageForm.value],
        skills: [this.skillsForm.value],
        contacts: [this.contactForm.value]
      };

      console.log('Candidate Data: ', candidateData);
    } else {
      this.markAllFormsTouched();
    }
  }
}
