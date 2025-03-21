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
  // Steps for the stepper, including the new Contact step.
  steps: MenuItem[] = [];
  activeIndex: number = 0;

  // Dropdown options.
  degrees = [
    { label: 'Bachelor', value: 'Bachelor' },
    { label: 'Master', value: 'Master' },
    { label: 'PhD', value: 'PhD' },
    { label: 'Associate', value: 'Associate' }
  ];

  languageLevels = [
    { label: 'A1', value: 'A1' },
    { label: 'A2', value: 'A2' },
    { label: 'B1', value: 'B1' },
    { label: 'B2', value: 'B2' },
    { label: 'C1', value: 'C1' },
    { label: 'C2', value: 'C2' }
  ];

  skillProficiencies = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' },
    { label: 'Expert', value: 'Expert' }
  ];

  // Form groups.
  generalDataForm!: FormGroup;
  addressForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  languageForm!: FormGroup;
  skillsForm!: FormGroup;
  contactForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Define the steps.
    this.steps = [
      { label: 'General Data' },
      { label: 'Address' },
      { label: 'Education' },
      { label: 'Experience' },
      { label: 'Languages' },
      { label: 'Skills' },
      { label: 'Contact' }
    ];

    // GENERAL DATA: fullName, birthDate, yearsOfExperience, gender, mainTech, summary.
    this.generalDataForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.pattern('^[A-Za-z\\s]+$')]],
        birthDate: ['', [Validators.required, this.ageValidator]],
        yearsOfExperience: [
          null,
          [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)]
        ],
        gender: ['', Validators.required],
        mainTech: ['', Validators.required],
        summary: ['', Validators.required]
      },
      { validators: this.experienceAgeValidator }
    );

    // ADDRESS: street, postalCode, fullAddress, city, country.
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\s-]{3,10}$')]],
      fullAddress: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s-]+$')]],
      country: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s-]+$')]]
    });

    // EDUCATION: institution, degree, startDate, endDate, diploma.
    this.educationForm = this.fb.group({
      institution: ['', Validators.required],
      degree: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      diploma: ['', Validators.required]
    });

    // EXPERIENCE: companyName, position, startDate, endDate, description.
    this.experienceForm = this.fb.group(
      {
        companyName: ['', Validators.required],
        position: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        description: ['', Validators.required]
      },
      { validators: this.experienceDateValidator }
    );

    // LANGUAGE: language, level, isNative.
    this.languageForm = this.fb.group({
      language: ['', Validators.required],
      level: ['', Validators.required],
      isNative: [false]
    });

    // SKILLS: skillName, proficiencyLevel.
    this.skillsForm = this.fb.group({
      skillName: ['', Validators.required],
      proficiencyLevel: ['', Validators.required]
    });

    // CONTACT: phone, email, contactType (could be used to differentiate types), etc.
    this.contactForm = this.fb.group({
      contactType: ['Email', Validators.required], // example: Email, Phone, LinkedIn, etc.
      contactValue: ['', [Validators.required, Validators.pattern(/^(?:\+?\d{10,15}|[^@]+@[^@]+\.[^@]+)$/)]]
    });
  }

  /*** Custom Validators ***/

  // Age validator: ensures the candidate is at least 18 and not over 80.
  ageValidator(control: AbstractControl): ValidationErrors | null {
    const birthDate = control.value;
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) return { underAge: true };
      if (age > 80) return { overAge: true };
    }
    return null;
  }

  // Validator to ensure years of experience do not exceed what is possible from age.
  experienceAgeValidator(control: AbstractControl): ValidationErrors | null {
    const birthDateControl = control.get('birthDate');
    const yearsControl = control.get('yearsOfExperience');

    if (birthDateControl?.value && yearsControl?.value) {
      const birthDate = new Date(birthDateControl.value);
      const yearsOfExperience = parseInt(yearsControl.value, 10);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Assume working starts at age 16.
      const maxExperience = age - 16;
      if (yearsOfExperience > maxExperience) {
        return { invalidExperience: true };
      }
    }
    return null;
  }

  // Validator to check that the experience dates are valid.
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

  /*** Helper Functions ***/

  // Return the current form group based on the active step.
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

  // Check if every form in the stepper is valid.
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

  // Mark all forms as touched.
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

  // Navigation methods.
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

  // Final submission.
  onSubmit(): void {
    if (this.areAllFormsValid()) {
      // Build the candidate object following your model interfaces.
      const candidateData = {
        fullName: this.generalDataForm.value.fullName,
        birthDate: this.generalDataForm.value.birthDate,
        yearsOfExperience: this.generalDataForm.value.yearsOfExperience,
        gender: this.generalDataForm.value.gender,
        mainTech: this.generalDataForm.value.mainTech,
        summary: this.generalDataForm.value.summary,
        address: this.addressForm.value,
        educations: [this.educationForm.value],
        experiences: [this.experienceForm.value],
        languages: [this.languageForm.value],
        skills: [this.skillsForm.value],
        contacts: [this.contactForm.value]
      };

      console.log('Candidate Data: ', candidateData);
      // TODO: Inject and call your CandidateService here to persist the candidateData.
    } else {
      this.markAllFormsTouched();
    }
  }
}
