import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload.component';
import { FileProcessingService } from '../services/file-processing.service';
import { ExpenseService } from '../services/expense.service';
import { ErrorHandlingService } from '../services/error-handling.service';
import { FileProcessingResult, ExpenseImportResult } from '../models/expense.model';

@Component({
  selector: 'app-expense-import',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  template: `
    <div class="expense-import">
      <h2>Import Expenses</h2>

      @if (hasConfigurationError) {
        <div class="config-error">
          <div class="error-icon">⚠️</div>
          <h3>Configuration Required</h3>
          <p>{{ configurationError }}</p>
          <p>Please update your <code>src/environments/environment.ts</code> file with your Supabase credentials.</p>
        </div>
      }

      @if (!selectedFile) {
        <app-file-upload (fileSelected)="onFileSelected($event)"></app-file-upload>
      } @else {
        <div class="file-preview">
          <div class="file-info">
            <h3>Selected File: {{ selectedFile.name }}</h3>
            <p>Size: {{ formatFileSize(selectedFile.size) }}</p>
            @if (processingResult && processingResult.metadata && processingResult.metadata.bankFormat && processingResult.metadata.bankFormat !== 'generic') {
              <p class="bank-format">Detected: <strong>{{ processingResult.metadata.bankFormat | titlecase }} Bank Format</strong></p>
            }
          </div>

          <div class="action-buttons">
            <button
              type="button"
              class="btn btn-primary"
              (click)="processFile()"
              [disabled]="isProcessing || isImporting || hasConfigurationError"
            >
              @if (isProcessing) {
                <span class="spinner"></span>
                Processing File...
              } @else if (isImporting) {
                <span class="spinner"></span>
                Importing Data...
              } @else {
                Import Expenses
              }
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              (click)="clearFile()"
              [disabled]="isProcessing"
            >
              Choose Different File
            </button>
          </div>
        </div>
      }

      @if (processingResult) {
        <div class="results">
          <h3>Processing Results</h3>
          <div class="stats">
            <div class="stat">
              <span class="stat-label">Total Rows:</span>
              <span class="stat-value">{{ processingResult.metadata.totalRows }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Valid Expenses:</span>
              <span class="stat-value success">{{ processingResult.metadata.validRows }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Errors:</span>
              <span class="stat-value error">{{ processingResult.metadata.invalidRows }}</span>
            </div>
          </div>

          @if (processingResult.errors.length > 0) {
            <div class="errors">
              <h4>Errors Found:</h4>
              <ul>
                @for (error of processingResult.errors; track $index) {
                  <li>{{ error }}</li>
                }
              </ul>
            </div>
          }

          @if (importResult) {
            <div class="import-status">
              <h4>Import Status:</h4>
              @if (importResult.success) {
                <p class="success">
                  ✅ Successfully imported {{ importResult.totalImported }} of {{ importResult.totalProcessed }} expenses
                </p>
              } @else {
                <p class="error">
                  ❌ Import failed: {{ importResult.errors?.join(', ') }}
                </p>
              }
            </div>
          }

          @if (processingResult.expenses.length > 0 && !importResult) {
            <div class="preview">
              <h4>Data Preview (first 5 rows):</h4>
              <div class="table-container">
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (expense of processingResult.expenses.slice(0, 5); track expense.description) {
                      <tr>
                        <td>{{ expense.date }}</td>
                        <td>{{ expense.description }}</td>
                        <td>{{ expense.amount | number:'1.2-2' }}</td>
                        <td>{{ expense.category }}</td>
                        <td>{{ expense.currency }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .expense-import {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .config-error {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    .error-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .config-error h3 {
      color: #92400e;
      margin: 0 0 0.5rem 0;
    }

    .config-error p {
      color: #78350f;
      margin: 0.5rem 0;
    }

    .config-error code {
      background: #fed7aa;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #1f2937;
    }

    .file-preview {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .file-info h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .file-info p {
      margin: 0;
      color: #6b7280;
    }

    .bank-format {
      color: #059669;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #10b981;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #059669;
    }

    .btn-secondary {
      background-color: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #4b5563;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .results {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .stat-label {
      font-weight: 500;
      color: #6b7280;
    }

    .stat-value {
      font-weight: 600;
    }

    .stat-value.success {
      color: #10b981;
    }

    .stat-value.error {
      color: #ef4444;
    }

    .errors {
      margin-bottom: 1.5rem;
    }

    .errors h4 {
      color: #ef4444;
      margin-bottom: 0.5rem;
    }

    .errors ul {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 1rem;
      margin: 0;
    }

    .errors li {
      color: #dc2626;
      margin-bottom: 0.25rem;
    }

    .import-status {
      margin-bottom: 1.5rem;
    }

    .import-status h4 {
      margin-bottom: 0.5rem;
    }

    .success {
      color: #10b981;
      font-weight: 500;
    }

    .error {
      color: #ef4444;
      font-weight: 500;
    }

    .preview h4 {
      margin-bottom: 1rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .preview-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .preview-table th,
    .preview-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .preview-table th {
      background: #f1f5f9;
      font-weight: 600;
      color: #374151;
    }

    .preview-table tbody tr:hover {
      background: #f8fafc;
    }
  `]
})
export class ExpenseImportComponent {
  selectedFile: File | null = null;
  isProcessing = false;
  isImporting = false;
  processingResult: FileProcessingResult | null = null;
  importResult: ExpenseImportResult | null = null;
  hasConfigurationError = false;
  configurationError = '';

  private fileProcessingService = inject(FileProcessingService);
  private expenseService = inject(ExpenseService);
  private errorService = inject(ErrorHandlingService);

  constructor() {
    this.checkConfiguration();
  }

  private checkConfiguration(): void {
    try {
      // Try to access the Supabase client to check if configuration is valid
      this.expenseService.getExpenses(1).catch(() => {
        // This will fail if Supabase is not configured
        this.hasConfigurationError = true;
        this.configurationError = 'Supabase is not properly configured. Please check your environment variables.';
      });
    } catch (error) {
      this.hasConfigurationError = true;
      this.configurationError = 'Configuration error: Please check your Supabase setup.';
      this.errorService.handleError(error, 'Configuration Check');
    }
  }

  onFileSelected(file: File): void {
    this.selectedFile = file;
    this.processingResult = null;
    this.importResult = null;
  }

  async processFile(): Promise<void> {
    if (!this.selectedFile) return;

    console.log('[ExpenseImport] Starting file processing for:', this.selectedFile.name);
    this.isProcessing = true;
    this.processingResult = null;
    this.importResult = null;

    try {
      console.log('[ExpenseImport] Calling fileProcessingService.processFile()');
      // Process the file
      this.processingResult = await this.fileProcessingService.processFile(this.selectedFile);
      console.log('[ExpenseImport] File processing completed. Expenses found:', this.processingResult.expenses.length);

      // Automatically import if there are valid expenses and no configuration errors
      if (this.processingResult.expenses.length > 0 && !this.hasConfigurationError) {
        console.log('[ExpenseImport] Starting automatic import of', this.processingResult.expenses.length, 'expenses');
        await this.importProcessedData();
      } else {
        console.log('[ExpenseImport] Skipping import - expenses:', this.processingResult.expenses.length, 'config error:', this.hasConfigurationError);
      }
    } catch (error) {
      console.error('[ExpenseImport] Error in processFile:', error);
      this.errorService.handleError(error, 'File Processing');
      this.processingResult = {
        expenses: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        metadata: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 1,
          fileType: 'csv'
        }
      };
    } finally {
      console.log('[ExpenseImport] processFile completed, setting isProcessing to false');
      this.isProcessing = false;
    }
  }

  async importProcessedData(): Promise<void> {
    if (!this.processingResult?.expenses.length) {
      console.log('[ExpenseImport] No expenses to import');
      return;
    }

    console.log('[ExpenseImport] Starting import of', this.processingResult.expenses.length, 'expenses');
    this.isImporting = true;

    try {
      console.log('[ExpenseImport] Calling expenseService.importExpenses()');
      this.importResult = await this.expenseService.importExpenses(this.processingResult.expenses);
      console.log('[ExpenseImport] Import completed. Success:', this.importResult.success, 'Imported:', this.importResult.totalImported);
    } catch (error) {
      console.error('[ExpenseImport] Error in importProcessedData:', error);
      this.errorService.handleError(error, 'Data Import');
      this.importResult = {
        success: false,
        errors: [error instanceof Error ? error.message : 'Import failed'],
        totalProcessed: this.processingResult.expenses.length,
        totalImported: 0
      };
    } finally {
      console.log('[ExpenseImport] importProcessedData completed, setting isImporting to false');
      this.isImporting = false;
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.processingResult = null;
    this.importResult = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
