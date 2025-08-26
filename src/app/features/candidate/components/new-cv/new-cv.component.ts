import { Component } from '@angular/core';
import { NewCvService } from '../../../../core/services/new-cv.service';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { Router } from '@angular/router';
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { CommonModule } from '@angular/common';
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'app-new-cv',
    standalone: true,
    templateUrl: './new-cv.component.html',
    styleUrls: ['./new-cv.component.scss'],
    imports: [CommonModule, ButtonModule, FileUploadModule, LoaderComponent,PanelModule]
})
export class NewCvComponent {
    selectedFile: File | null = null;
    extractedData: string | null = null;
    isLoading$;
    loadingMessage$;
    successMessage: string | null = null;

    constructor(private newService: NewCvService, private router: Router, private loaderService: LoaderService) {
        this.isLoading$ = this.loaderService.isLoading$;
        this.loadingMessage$ = this.loaderService.loadingMessage$;
    }


    onFileSelected(event: any): void {
        if (event?.files?.length) {
            this.selectedFile = event.files[0];
            console.log('File Selected', this.selectedFile);
            this.successMessage = `CV "${this.selectedFile?.name}" selected successfully!`;
        } else {
            console.error('No files selected');
            this.successMessage = null;
        }
    }
    onFileCleared(): void {
        this.selectedFile = null;
        this.successMessage = null;
    }

    uploadCv(): void {
        if (this.selectedFile) {
            this.loaderService.show('Uploading CV...');
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64File = reader.result as string;
                const mimeType = this.selectedFile?.type || 'application/octet-stream';

                const payload = {
                    promptCode: 'JSON_EXTRACTION_CODE',
                    mimeType: mimeType,
                    b64EFile: base64File.split(',')[1]
                };

                this.newService.uploadCv(payload).subscribe(
                    (response: any) => {
                        this.loaderService.hide();
                        alert('CV uploaded successfully!');
                        console.log('Server response:', response);

                        this.router.navigate(['/candidates/stepper'], {
                            state: { extractedData: response }
                        });
                    },
                    error => {
                        this.loaderService.hide();
                        alert('Error uploading CV.');
                        console.error('Upload error:', error);
                    }
                );
            };

            reader.readAsDataURL(this.selectedFile);
        } else {
            alert('No file selected!');
        }
    }
}
