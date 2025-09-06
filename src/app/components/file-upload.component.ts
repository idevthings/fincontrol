import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      <div
        class="upload-area"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <div class="upload-content">
          <div class="upload-icon">📁</div>
          <h3>Import Your Expenses</h3>
          <p>Drag and drop your CSV or JSON file here, or click to browse</p>
          <button type="button" class="upload-button">
            Choose File
          </button>
          <small class="file-types">Supports: .csv, .json</small>
        </div>
      </div>

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
      max-width: 500px;
      margin: 2rem auto;
    }

    .upload-area {
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #f8fafc;
    }

    .upload-area:hover {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }

    .upload-area.drag-over {
      border-color: #10b981;
      background-color: #ecfdf5;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .upload-icon {
      font-size: 3rem;
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
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .upload-button:hover {
      background-color: #2563eb;
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
