import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MenuItem, MessageService } from 'primeng/api';
import { Candidate } from '../../../../core/models/candidate';
import { NewCvService } from '../../../../core/services/new-cv.service';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-candidate-form',
    standalone: true,
    imports: [CommonModule, PanelModule, StepsModule, InputTextModule, InputTextarea, ButtonModule, CheckboxModule, ReactiveFormsModule, DropdownModule, RadioButtonModule,ToastModule],
    templateUrl: './stepper-form.component.html',
    styleUrls: ['./stepper-form.component.scss'],
    providers: [MessageService]
})
export class StepperFormComponent implements OnInit {
    steps: MenuItem[] = [];
    activeIndex: number = 0;
    extractedData: any;

    languageLevels = [
        { label: 'Advanced', value: 'ADVANCED' },
        { label: 'Intermediate', value: 'INTERMEDIATE' },
        { label: 'Upper Intermediate', value: 'UPPER_INTERMEDIATE' },
        { label: 'Lower Intermediate', value: 'LOWER_INTERMEDIATE' },
        { label: 'Basic', value: 'BEGINNER' },
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

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router : Router ,
        private newCvService: NewCvService,
        private messageService: MessageService,

    ) {}

    ngOnInit() {
        this.steps = [{ label: 'General Data' }, { label: 'Address' }, { label: 'Education' }, { label: 'Experience' }, { label: 'Languages' }, { label: 'Skills' }, { label: 'Contact' }];

        // General Data Form
        this.generalDataForm = this.fb.group(
            {
                fullName: ['', [Validators.required, Validators.pattern('^[A-Za-z\\s]+$')]],
                birthDate: ['', [Validators.required, this.ageValidator]],
                yearsOfExperience: [null, [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)]],
                gender: ['', Validators.required],
                mainTech: ['', Validators.required],
                summary: ['', Validators.required]
            },
            { validators: this.experienceAgeValidator }
        );

        this.addressForm = this.fb.group({
            street: ['', Validators.required],
            postalCode: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\s-]{3,10}$')]],
            fullAddress: ['', Validators.required],
            city: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s-]+$')]],
            country: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s-]+$')]],
        });

        this.educationForm = this.fb.group({
            institution: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            diploma: ['', Validators.required]
        });

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

        // validator for language
        this.languageForm = this.fb.group({
            language: ['', [Validators.required, Validators.pattern('^[A-Za-z\\s]+$')]],
            level: ['', Validators.required],
            description: ['',Validators.required],
            englishDescription:[''] ,
            languageInEnglish:[''],
            isNative: [false]
        });

        this.skillsForm = this.fb.group({
            skillName: ['', Validators.required],
            proficiencyLevel: ['', Validators.required]
        });

        this.contactForm = this.fb.group({
            contactType: ['Email', Validators.required],
            contactValue: ['', [Validators.required, Validators.pattern(/^(?:\+?\d{10,15}|[^@]+@[^@]+\.[^@]+)$/)]]
        });

        this.route.paramMap.subscribe((params) => {
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

        if (this.extractedData.experiences && this.extractedData.experiences.length > 0) {
            this.experienceForm.patchValue({
                companyName: this.extractedData.experiences[0].companyName || '',
                position: this.extractedData.experiences[0].position || '',
                startDate: this.extractedData.experiences[0].startDate || '',
                endDate: this.extractedData.experiences[0].endDate || '',
                description: this.extractedData.experiences[0].description || ''
            });
        }

        // ;anguage map
        if (this.extractedData.naturalLanguages && this.extractedData.naturalLanguages.length > 0) {
            this.languageForm.patchValue({
                language: this.extractedData.naturalLanguages[0].language || '',
                level: this.extractedData.naturalLanguages[0].level || '',
                isNative: this.extractedData.naturalLanguages[0].isNative || this.extractedData.naturalLanguages[0].description === 'Native' || false,
                description: this.extractedData.naturalLanguages[0].description || ''
            });
        } else if (this.extractedData.languages && this.extractedData.languages.length > 0) {
            this.languageForm.patchValue({
                language: this.extractedData.languages[0].language || '',
                level: this.extractedData.languages[0].level || '',
                description: this.extractedData.naturalLanguages[0].description || '',
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
            const contactType = this.extractedData.contacts[0].contactType ? this.extractedData.contacts[0].contactType.charAt(0).toUpperCase() + this.extractedData.contacts[0].contactType.slice(1).toLowerCase() : 'Email';
            this.contactForm.patchValue({
                contactType: ['Email', 'Phone', 'LinkedIn'].includes(contactType) ? contactType : 'Email',
                contactValue: this.extractedData.contacts[0].contactValue || ''
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
            if (today.getMonth() < birthDateObj.getMonth() || (today.getMonth() === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())) {
                age--;
            }
            if (age < 18) return { underAge: true };
            if (age > 80) return { overAge: true };
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
            if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
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
        return [this.generalDataForm, this.addressForm, this.educationForm, this.experienceForm, this.languageForm, this.skillsForm, this.contactForm].every((form) => form.valid);
    }

    markAllFormsTouched(): void {
        [this.generalDataForm, this.addressForm, this.educationForm, this.experienceForm, this.languageForm, this.skillsForm, this.contactForm].forEach((form) => form.markAllAsTouched());
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
        const candidateData: Candidate = {
          ...this.generalDataForm.value,
          address: {
            ...this.addressForm.value,
            city: { name: this.addressForm.value.city },
            country: { name: this.addressForm.value.country, englishName: this.addressForm.value.englishName || this.addressForm.value.country }
          },
          educations: [this.educationForm.value],
          experiences: [this.experienceForm.value],
          naturalLanguages: [{
            ...this.languageForm.value,
            isNative: this.languageForm.value.isNative
          }],
          skills: [this.skillsForm.value],
          contacts: [{
            ...this.contactForm.value,
            contactType: this.contactForm.value.contactType
          }]

        };
  
        candidateData.gender = this.generalDataForm.value.gender === 'Male' ? 'M' : 'F';
      
        console.log('Candidate Data:', candidateData);
        this.newCvService.saveCandidate(candidateData).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Candidate added successfully',
                life: 0 ,
                closable: true
              });
              setTimeout(() => {
                this.router.navigate(['/candidates/candidate-list']);
              }, 2000);
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Failed to create candidate',
                life: 3000
              });
            }
          });
      
        } else {
          this.markAllFormsTouched();
          this.messageService.add({
            severity: 'warn',
            summary: 'Validation Error',
            life: 3000
          });
        }
    }
}


