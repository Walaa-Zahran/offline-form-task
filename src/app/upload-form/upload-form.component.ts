import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrl: './upload-form.component.scss',
})
export class UploadFormComponent {
  uploadForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      textInput: ['', Validators.required],
      imageUpload: [null, Validators.required],
      voiceUpload: [null, Validators.required],
    });
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
    console.log(formData);
    // Define an observer object
    const observer = {
      next: (res: any) => console.log(res),
      error: (err: any) => console.error(err),
      complete: () => console.log('Completed'),
    };

    // Use the observer object in the subscribe method
    // this.http.post('/your-backend-endpoint', formData).subscribe(observer);
  }
}
