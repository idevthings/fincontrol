import { Injectable } from '@angular/core';
import { Expense, FileProcessingResult } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class FileProcessingService {

  async processFile(file: File): Promise<FileProcessingResult> {
    const fileType = this.getFileType(file);

    if (fileType === 'csv') {
      return this.processCSV(file);
    } else if (fileType === 'json') {
      return this.processJSON(file);
    } else {
      throw new Error('Unsupported file type. Only CSV and JSON files are supported.');
    }
  }

  private getFileType(file: File): 'csv' | 'json' | null {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') return 'csv';
    if (extension === 'json') return 'json';
    return null;
  }

  private async processCSV(file: File): Promise<FileProcessingResult> {
    try {
      const text = await file.text();
      const rows = this.parseCSV(text);
      const { expenses, errors } = this.parseExpenseData(rows);

      return {
        expenses,
        errors,
        metadata: {
          totalRows: rows.length,
          validRows: expenses.length,
          invalidRows: errors.length,
          fileType: 'csv'
        }
      };
    } catch (error) {
      throw new Error(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseCSV(csvText: string): any[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = this.parseCSVLine(lines[0]);
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }

    return rows;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private async processJSON(file: File): Promise<FileProcessingResult> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Handle both array and object with array property
      const rawData = Array.isArray(data) ? data : data.expenses || data.data || [];

      const { expenses, errors } = this.parseExpenseData(rawData);

      return {
        expenses,
        errors,
        metadata: {
          totalRows: rawData.length,
          validRows: expenses.length,
          invalidRows: errors.length,
          fileType: 'json'
        }
      };
    } catch (error) {
      throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseExpenseData(rawData: any[]): { expenses: Expense[]; errors: string[] } {
    const expenses: Expense[] = [];
    const errors: string[] = [];

    rawData.forEach((row, index) => {
      try {
        const expense = this.mapToExpense(row);
        if (expense) {
          expenses.push(expense);
        }
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    });

    return { expenses, errors };
  }

  private mapToExpense(row: any): Expense | null {
    // Flexible mapping for different CSV/JSON formats
    const date = this.parseDate(row.date || row.Date || row.transaction_date || row['Transaction Date']);
    const description = this.sanitizeText(row.description || row.Description || row.memo || row.Memo || row.details || row.Details);
    const amount = this.parseAmount(row.amount || row.Amount || row.value || row.Value || row.total || row.Total);
    const category = this.sanitizeText(row.category || row.Category || row.type || row.Type || 'Uncategorized');
    const currency = this.sanitizeText(row.currency || row.Currency || 'USD');
    const account = this.sanitizeText(row.account || row.Account || row.account_name || row['Account Name']);

    if (!date) {
      throw new Error('Missing or invalid date');
    }

    if (!description) {
      throw new Error('Missing description');
    }

    if (amount === null) {
      throw new Error('Missing or invalid amount');
    }

    return {
      date: date.toISOString().split('T')[0], // Store as YYYY-MM-DD
      description: String(description).trim(),
      amount,
      category: String(category).trim(),
      currency: String(currency).trim(),
      account: account ? String(account).trim() : undefined,
      tags: this.parseTags(row.tags || row.Tags)
    };
  }

  private parseDate(dateStr: any): Date | null {
    if (!dateStr) return null;

    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  private parseAmount(amountStr: any): number | null {
    if (amountStr === null || amountStr === undefined || amountStr === '') return null;

    try {
      const amount = typeof amountStr === 'number' ? amountStr : parseFloat(String(amountStr).replace(/[$,]/g, ''));
      return isNaN(amount) ? null : amount;
    } catch {
      return null;
    }
  }

  private parseTags(tagsStr: any): string[] | undefined {
    if (!tagsStr) return undefined;

    try {
      if (Array.isArray(tagsStr)) {
        return tagsStr.map(tag => this.sanitizeText(tag)).filter((tag): tag is string => tag !== undefined && tag.length > 0);
      }

      if (typeof tagsStr === 'string') {
        return tagsStr.split(',').map(tag => this.sanitizeText(tag)).filter((tag): tag is string => tag !== undefined && tag.length > 0);
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  private sanitizeText(text: any): string | undefined {
    if (text === null || text === undefined) return undefined;

    const sanitized = String(text).trim();

    // Remove any potentially harmful characters and limit length
    const cleanText = sanitized.replace(/[<>\"'&]/g, '').substring(0, 255);

    return cleanText.length > 0 ? cleanText : undefined;
  }
}
