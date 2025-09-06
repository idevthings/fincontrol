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
  template: `
    <div class="expense-import">
      <h2>Import Expenses</h2>

      @if (hasConfigurationError) {
        <mat-card class="config-error">
          <mat-card-content>
            <div class="error-icon">
              <mat-icon color="warn">warning</mat-icon>
            </div>
            <h3>Configuration Required</h3>
            <p>{{ configurationError }}</p>
            <p>Please update your <code>src/environments/environment.ts</code> file with your Supabase credentials.</p>
          </mat-card-content>
        </mat-card>
      }

      @if (!selectedFile) {
        <div class="import-options">
          <app-file-upload (fileSelected)="onFileSelected($event)"></app-file-upload>
          
          <mat-card class="bank-integration-card disabled">
            <mat-card-content>
              <div class="bank-integration-content">
                <div class="bank-icon">
                  <mat-icon>account_balance</mat-icon>
                </div>
                <h3>Open Bank Integration</h3>
                <p>Connect directly to your bank via Open Banking API for real-time expense tracking</p>
                <button mat-raised-button color="primary" disabled class="integration-button">
                  <mat-icon>link</mat-icon>
                  Connect Bank Account
                </button>
                <small class="coming-soon">Coming Soon</small>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      } @else {
        <mat-card class="file-preview">
          <mat-card-content>
            <div class="file-info">
              <h3>Selected File: {{ selectedFile.name }}</h3>
              <p>Size: {{ formatFileSize(selectedFile.size) }}</p>
              @if (processingResult && processingResult.metadata && processingResult.metadata.bankFormat && processingResult.metadata.bankFormat !== 'generic') {
                <mat-chip color="primary" selected>
                  <mat-icon>account_balance</mat-icon>
                  {{ processingResult.metadata.bankFormat | titlecase }} Bank Format
                </mat-chip>
              }
            </div>

            <div class="action-buttons">
              <button
                mat-raised-button
                color="primary"
                type="button"
                (click)="processFile()"
                [disabled]="isProcessing || isImporting || hasConfigurationError"
              >
                @if (isProcessing) {
                  <mat-spinner diameter="20"></mat-spinner>
                  Processing File...
                } @else if (isImporting) {
                  <mat-spinner diameter="20"></mat-spinner>
                  Importing Data...
                } @else {
                  <mat-icon>upload</mat-icon>
                  Import Expenses
                }
              </button>
              <button
                mat-stroked-button
                type="button"
                (click)="clearFile()"
                [disabled]="isProcessing"
              >
                <mat-icon>folder_open</mat-icon>
                Choose Different File
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      @if (processingResult) {
        <mat-card class="results">
          <mat-card-header>
            <mat-card-title>Processing Results</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats">
              <mat-card class="stat">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon>table_rows</mat-icon>
                    <div>
                      <div class="stat-label">Total Rows</div>
                      <div class="stat-value">{{ processingResult.metadata.totalRows }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              <mat-card class="stat success">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon color="primary">check_circle</mat-icon>
                    <div>
                      <div class="stat-label">Valid Expenses</div>
                      <div class="stat-value">{{ processingResult.metadata.validRows }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              <mat-card class="stat error">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon color="warn">error</mat-icon>
                    <div>
                      <div class="stat-label">Errors</div>
                      <div class="stat-value">{{ processingResult.metadata.invalidRows }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            @if (processingResult.errors.length > 0) {
              <mat-card class="errors">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon color="warn">error</mat-icon>
                    Errors Found
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <ul>
                    @for (error of processingResult.errors; track $index) {
                      <li>{{ error }}</li>
                    }
                  </ul>
                </mat-card-content>
              </mat-card>
            }

            @if (importResult) {
              <mat-card class="import-status">
                <mat-card-header>
                  <mat-card-title>Import Status</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @if (importResult.success) {
                    <div class="success">
                      <mat-icon color="primary">check_circle</mat-icon>
                      Successfully imported {{ importResult.totalImported }} of {{ importResult.totalProcessed }} expenses
                    </div>
                  } @else {
                    <div class="error">
                      <mat-icon color="warn">error</mat-icon>
                      Import failed: {{ importResult.errors?.join(', ') }}
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            }

            @if (processingResult.expenses.length > 0 && !importResult) {
              <mat-card class="preview">
                <mat-card-header>
                  <mat-card-title>Data Preview (first 5 rows)</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="table-container">
                    <table mat-table [dataSource]="processingResult.expenses.slice(0, 5)" class="preview-table">
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Date</th>
                        <td mat-cell *matCellDef="let expense">{{ expense.date }}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="description">
                        <th mat-header-cell *matHeaderCellDef>Description</th>
                        <td mat-cell *matCellDef="let expense">{{ expense.description }}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef>Amount</th>
                        <td mat-cell *matCellDef="let expense">{{ expense.amount | number:'1.2-2' }}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="category">
                        <th mat-header-cell *matHeaderCellDef>Category</th>
                        <td mat-cell *matCellDef="let expense">{{ expense.category }}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="currency">
                        <th mat-header-cell *matHeaderCellDef>Currency</th>
                        <td mat-cell *matCellDef="let expense">{{ expense.currency }}</td>
                      </ng-container>
                      
                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .expense-import {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .import-options {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      align-items: stretch;
      height: 400px;
    }

    .import-options > * {
      flex: 1 1 50%;
      width: 50%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 768px) {
      .import-options {
        flex-direction: column;
        height: auto;
      }
      
      .import-options > * {
        flex: none;
        width: 100%;
        height: auto;
      }
    }

    .bank-integration-card {
      opacity: 0.6;
      cursor: not-allowed;
      border: 2px dashed #cbd5e1 !important;
      background-color: #f8fafc;
      flex: 1;
      min-width: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .bank-integration-card.disabled {
      background-color: #f1f5f9;
    }

    .bank-integration-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
      padding: 2rem !important;
      height: 100%;
      justify-content: center;
    }

    .bank-icon {
      font-size: 3rem;
      color: #6b7280;
    }

    .bank-icon mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }

    .bank-integration-content h3 {
      margin: 0;
      color: #6b7280;
    }

    .bank-integration-content p {
      margin: 0;
      color: #9ca3af;
      max-width: 400px;
    }

    .integration-button {
      margin-top: 0.5rem;
    }

    .coming-soon {
      color: #9ca3af;
      font-size: 0.875rem;
      font-style: italic;
    }

    .config-error {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      margin-bottom: 2rem;
    }

    .error-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .error-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
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

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .results {
      margin-bottom: 2rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat {
      min-height: 80px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-content mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .stat-label {
      font-weight: 500;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .stat-value {
      font-weight: 600;
      font-size: 1.25rem;
    }

    .stat.success {
      border-left: 4px solid #10b981;
    }

    .stat.error {
      border-left: 4px solid #ef4444;
    }

    .errors {
      margin-bottom: 1.5rem;
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

    .success {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #10b981;
      font-weight: 500;
    }

    .error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ef4444;
      font-weight: 500;
    }

    .preview {
      margin-bottom: 2rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .preview-table {
      width: 100%;
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
  displayedColumns: string[] = ['date', 'description', 'amount', 'category', 'currency'];

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
