import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload.component';
import { FileProcessingService } from '../services/file-processing.service';
import { ExpenseService } from '../services/expense.service';
import { ErrorHandlingService } from '../services/error-handling.service';
import { FileProcessingResult, ExpenseImportResult } from '../models/expense.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-expense-import',
  standalone: true,
  imports: [
    CommonModule, 
    FileUploadComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './expense-import.component.html',
  styleUrl: './expense-import.component.css'
})
export class ExpenseImportComponent {
  selectedFile: File | null = null;
  isProcessing = false;
  isImporting = false;
  processingResult: FileProcessingResult | null = null;
  importResult: ExpenseImportResult | null = null;
  hasConfigurationError = false;
  configurationError = '';
  displayedColumns: string[] = ['date', 'description', 'amount', 'category', 'subcategory', 'currency'];

  private fileProcessingService = inject(FileProcessingService);
  private expenseService = inject(ExpenseService);
  private errorService = inject(ErrorHandlingService);
  private cdr = inject(ChangeDetectorRef);

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
      this.isProcessing = false;
      this.cdr.detectChanges();
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
      this.isImporting = false;
      this.cdr.detectChanges();
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
