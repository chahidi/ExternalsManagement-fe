import { Component } from '@angular/core';
import { NewCvService } from '../../../../core/services/new-cv.service';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { Router } from '@angular/router';

@Component({
    selector: 'app-new-cv',
    standalone: true,
    templateUrl: './new-cv.component.html',
    styleUrls: ['./new-cv.component.scss'],
    imports: [ButtonModule, FileUploadModule]
})
export class NewCvComponent {
    selectedFile: File | null = null;
    extractedData: string | null = null;

    constructor(private newService: NewCvService, private router: Router) {}

    onFileSelected(event: any): void {
        if (event?.files?.length) {
            this.selectedFile = event.files[0];
            console.log('File Selected', this.selectedFile);
        } else {
            console.error('No files selected');
        }
    }

    uploadCv(): void {
        if (this.selectedFile) {
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
                        alert('CV uploaded successfully!');
                        console.log('Server response:', response);

                        this.router.navigate(['/candidates/stepper'], {
                            state: { extractedData: response }
                        });
                    },
                    error => {
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
