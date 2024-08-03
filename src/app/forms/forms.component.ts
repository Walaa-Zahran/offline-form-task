import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss',
})
export class FormsComponent implements AfterViewInit {
  uploadForm!: FormGroup;
  @ViewChild('cameraElement') cameraElement!: ElementRef;
  hide!: boolean;
  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      textInput: ['', Validators.required],
      imageUpload: [null, Validators.required],
      voiceUpload: [null, Validators.required],
    });
  }
  ngAfterViewInit() {
    this.startCamera();
  }
  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    console.log('Selected file:', file);

    this.uploadForm.controls[controlName].setValue(file);
    console.log(this.uploadForm);
  }
  onSubmit() {
    const formData = new FormData();
    formData.append('textInput', this.uploadForm.get('textInput')?.value);
    formData.append('imageUpload', this.uploadForm.get('imageUpload')?.value);
    formData.append('voiceUpload', this.uploadForm.get('voiceUpload')?.value);
    // Define an observer object
    const observer = {
      next: (res: any) => console.log(res),
      error: (err: any) => console.error(err),
      complete: () => console.log('Completed'),
    };

    // Use the observer object in the subscribe method
    // this.http.post('/your-backend-endpoint', formData).subscribe(observer);
  }

  startCamera() {
    if (this.cameraElement && typeof window !== 'undefined') {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          this.cameraElement.nativeElement.srcObject = stream;
        })
        .catch((error) =>
          console.error('Error accessing media devices.', error)
        );

      // Assuming you have a reference to the button element that triggers image capture
      this.captureImage(this.cameraElement)
        .then(() => {
          this.hide = true;
          console.log('Image captured successfully.');
        })
        .catch((error) => {
          console.error('Failed to capture image:', error);
        });
    } else {
      console.warn(
        'Camera element not found or running in a non-browser environment.'
      );
    }
  }
  captureImage(element: ElementRef): Promise<void> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = element.nativeElement.videoWidth;
      canvas.height = element.nativeElement.videoHeight;
      canvas
        .getContext('2d')
        ?.drawImage(element.nativeElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }

        // Create a new File object representing the image
        const file = new File([blob], 'captured-image.png', {
          type: 'image/png',
        });

        // Update the form control with the captured image file
        this.uploadForm.controls['imageUpload'].setValue(file);

        resolve();
      }, 'image/png');
    });
  }
}
