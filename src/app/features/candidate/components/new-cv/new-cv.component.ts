import { Component } from '@angular/core';
import { NewCvService } from '../../../../core/services/new-cv.service';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-new-cv',
  templateUrl: './new-cv.component.html',
  imports:[ButtonModule,FileUploadModule]
})
export class NewCvComponent {

  selectedFile: File | null = null;
  extractedData: string | null = null;

  constructor(private newService: NewCvService) {}


  onFileSelected(event: any): void {
    if (event?.files?.length) {
      this.selectedFile = event.files[0];
      console.log("File Selected", this.selectedFile);
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

        console.log("Base64 File:", base64File);
        console.log("MIME Type:", mimeType);


        const payload = {
          promptCode: "JSON_EXTRACTION_CODE",
          mimeType: mimeType,
          b64EFile: base64File.split(',')[1]
        };

        console.log("Payload to be sent:", payload);


        this.newService.uploadCv(payload).subscribe(
            (response: any) => {
                alert('CV uploaded successfully!');
                console.log("Server response type:", typeof response);
                console.log("Server response:", response);
                this.extractedData = JSON.stringify(response); // Convert to string for better visibility
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
