import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { error } from 'console';

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
      textInput: ['', Validators.required, Validators.maxLength(100)],
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
    if (this.uploadForm.get('imageUpload')?.value) {
      this.validateImage(file)
        .then((valid) => {
          if (valid) {
            this.uploadForm.controls[controlName].setValue(file);
            console.log(this.uploadForm);
          } else {
            alert('Image validation failed.');
          }
        })
        .catch((error) => console.log('an error occured', error));
    }
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
  validateImage(file: File): Promise<boolean> {
    // Check file type
    if (!this.isImageFileType(file.type)) {
      alert('Invalid file');
      return Promise.resolve(false);
    }

    // Check file size
    if (file.size > 1024 * 1024 * 5) {
      // 5MB limit
      console.error('File size exceeds the limit of 5MB.');
      return Promise.resolve(false);
    }

    // Check image dimensions
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > 1920 || img.height > 1080) {
          console.error(
            'Image dimensions exceed the maximum allowed size of 1920x1080 pixels.'
          );
          return Promise.resolve(false); // Return a resolved promise with false
        }
        console.log('Image validation passed.');
        return Promise.resolve(true); // Return a resolved promise with true
      };
      img.onerror = () => {
        console.error('Could not load the image.');
        return Promise.resolve(false); // Return a resolved promise with false
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    return new Promise<boolean>((resolve, reject) => {
      reader.onloadend = () => {
        resolve(true); // Resolve the promise with true if the file was loaded successfully
      };
      reader.onerror = () => {
        reject(false); // Reject the promise with false if there was an error reading the file
      };
    });
  }

  isImageFileType(type: string): boolean {
    // List of MIME types for common image formats
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return imageTypes.includes(type);
  }
}
