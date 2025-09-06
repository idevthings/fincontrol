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
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
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
