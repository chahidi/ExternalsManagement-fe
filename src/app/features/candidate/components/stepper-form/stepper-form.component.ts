import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MenuItem } from 'primeng/api';
import { RadioButton } from 'primeng/radiobutton';

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
    RadioButton 
  ],
  templateUrl: './stepper-form.component.html',
  styleUrls: ['./stepper-form.component.scss']
})
export class StepperFormComponent implements OnInit {
  steps: MenuItem[] = [];
  activeIndex: number = 0;

  // Dropdown options for education, language, and skills.
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

  // Form groups for each step.
  generalDataForm!: FormGroup;
  addressForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  languageForm!: FormGroup;
  skillsForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // Define the steps.
    this.steps = [
      { label: 'General Data' },
      { label: 'Address' },
      { label: 'Education' },
      { label: 'Experiences' },
      { label: 'Languages' },
      { label: 'Skills' }
    ];

    // Update generalDataForm with new pattern validators and group validator.
    this.generalDataForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern('^[A-Za-z\\s]+$')]], // Only letters and spaces
      birthDate: ['', [Validators.required, this.ageValidator]],  // Custom validator for 18+ check
      yearsOfExperience: [null, [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)]], // Only digits
      gender: ['', Validators.required],
      mainTech: ['', Validators.required],
      summary: ['', Validators.required]
    }, { validators: this.experienceAgeValidator });

    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      // Allows alphanumeric characters, spaces, and hyphens, with a length between 3 and 10 characters.
      postalCode: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\s-]{3,10}$')]],
      fullAddress: ['', Validators.required],
      city: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-Z\\s-]+$')]
      ],
      country: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-Z\\s-]+$')]
      ]
    });

    this.educationForm = this.fb.group({
      institution: ['', Validators.required],
      degree: ['', Validators.required], // Will be selected from dropdown.
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      diploma: ['', Validators.required]
    });

    this.experienceForm = this.fb.group({
      companyName: ['', Validators.required],
      position: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required]
    }, { validators: this.experienceDateValidator });

    this.languageForm = this.fb.group({
      language: ['', Validators.required],
      level: ['', Validators.required],  // Will be selected from dropdown.
      isNative: [false]
    });

    this.skillsForm = this.fb.group({
      skillName: ['', Validators.required],
      proficiencyLevel: ['', Validators.required]  // Will be selected from dropdown.
    });
  }

  // Custom validator to check that birthDate is at least 18 years ago.
  ageValidator(control: AbstractControl): ValidationErrors | null {
    const birthDate = control.value;
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) {
        return { underAge: true };
      }
    }
    return null;
  }

  // Custom validator to check that years of experience make sense given the birth date
  experienceAgeValidator(control: AbstractControl): ValidationErrors | null {
    const birthDateControl = control.get('birthDate');
    const yearsOfExperienceControl = control.get('yearsOfExperience');
    
    if (birthDateControl?.value && yearsOfExperienceControl?.value) {
      const birthDate = new Date(birthDateControl.value);
      const yearsOfExperience = parseInt(yearsOfExperienceControl.value);
      const today = new Date();
      
      // Calculate age
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Assume people start working at 16 at the earliest
      const maxPossibleExperience = age - 16;
      
      if (yearsOfExperience > maxPossibleExperience) {
        return { invalidExperience: true };
      }
    }
    return null;
  }

  // Custom validator for experience dates: end date cannot be in the future.
  experienceDateValidator(control: AbstractControl): ValidationErrors | null {
    const endDate = control.get('endDate')?.value;
    if (endDate) {
      const now = new Date();
      const end = new Date(endDate);
      if (end > now) {
        return { futureEndDate: true };
      }
    }
    return null;
  }

  // Returns the current step's form.
  getCurrentForm(): FormGroup {
    switch (this.activeIndex) {
      case 0: return this.generalDataForm;
      case 1: return this.addressForm;
      case 2: return this.educationForm;
      case 3: return this.experienceForm;
      case 4: return this.languageForm;
      case 5: return this.skillsForm;
      default: return this.generalDataForm;
    }
  }

  next() {
    const currentForm = this.getCurrentForm();
    if (currentForm.valid && this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
    } else {
      currentForm.markAllAsTouched();
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  clearCurrentSection() {
    this.getCurrentForm().reset();
  }

  onSubmit() {
    if (
      this.generalDataForm.valid &&
      this.addressForm.valid &&
      this.educationForm.valid &&
      this.experienceForm.valid &&
      this.languageForm.valid &&
      this.skillsForm.valid
    ) {
      const candidateData = {
        ...this.generalDataForm.value,
        address: this.addressForm.value,
        educations: [this.educationForm.value],
        experiences: [this.experienceForm.value],
        languages: [this.languageForm.value],
        skills: [this.skillsForm.value]
      };

      console.log('Candidate Data: ', candidateData);
      // TODO: Use CandidateService to save candidateData.
    } else {
      // Mark all forms as touched to show validation errors.
      this.generalDataForm.markAllAsTouched();
      this.addressForm.markAllAsTouched();
      this.educationForm.markAllAsTouched();
      this.experienceForm.markAllAsTouched();
      this.languageForm.markAllAsTouched();
      this.skillsForm.markAllAsTouched();
    }
  }
}