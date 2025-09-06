import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="file-upload-container">
      <mat-card 
        class="upload-card"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <mat-card-content class="upload-content">
          <div class="upload-icon">
            <mat-icon>cloud_upload</mat-icon>
          </div>
          <h3>Import Your Expenses</h3>
          <p>Drag and drop your CSV or JSON file here, or click to browse</p>
          <button mat-raised-button color="primary" type="button" class="upload-button">
            <mat-icon>folder_open</mat-icon>
            Choose File
          </button>
          <small class="file-types">Supports: .csv, .json</small>
        </mat-card-content>
      </mat-card>

      <input
        #fileInput
        type="file"
        class="hidden"
        accept=".csv,.json"
        (change)="onFileSelected($event)"
      />
    </div>
  `,
  styles: [`
    .file-upload-container {
      margin: 0;
      flex: 1;
      min-width: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .upload-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px dashed #cbd5e1 !important;
      background-color: #f8fafc;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .upload-card:hover {
      border-color: #3b82f6 !important;
      background-color: #eff6ff;
    }

    .upload-card.drag-over {
      border-color: #10b981 !important;
      background-color: #ecfdf5;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
      padding: 2rem !important;
      height: 100%;
      justify-content: center;
    }

    .upload-icon {
      font-size: 3rem;
      color: #6b7280;
    }

    .upload-icon mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }

    h3 {
      margin: 0;
      color: #1f2937;
    }

    p {
      margin: 0;
      color: #6b7280;
    }

    .upload-button {
      margin-top: 0.5rem;
    }

    .file-types {
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .hidden {
      display: none;
    }
  `]
})
export class FileUploadComponent {
  @Output() fileSelected = new EventEmitter<File>();

  isDragOver = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File): void {
    // Validate file type
    const allowedTypes = ['text/csv', 'application/json'];
    const allowedExtensions = ['.csv', '.json'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB limit

    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      alert('Please select a CSV or JSON file.');
      return;
    }

    if (file.size > maxFileSize) {
      alert('File size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    if (file.size === 0) {
      alert('The selected file is empty. Please choose a valid file.');
      return;
    }

    this.fileSelected.emit(file);
  }
}
