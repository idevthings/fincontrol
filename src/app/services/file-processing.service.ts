import { Injectable } from '@angular/core';
import Papa from 'papaparse';
import { Expense, FileProcessingResult } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class FileProcessingService {

  async processFile(file: File): Promise<FileProcessingResult> {
    console.log('[FileProcessingService] Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

    const fileType = this.getFileType(file);
    console.log('[FileProcessingService] Detected file type:', fileType);

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
    console.log('[FileProcessingService] Starting CSV processing');

    try {
      console.log('[FileProcessingService] Reading file text...');
      const text = await file.text();
      console.log('[FileProcessingService] File text length:', text.length);

      const bankFormat = this.detectBankFormat(text);
      console.log('[FileProcessingService] Detected bank format:', bankFormat);

      let expenses: Expense[] = [];
      let errors: string[] = [];

      if (bankFormat === 'ibercaja') {
        console.log('[FileProcessingService] Using PapaParse for Ibercaja CSV');
        const result = await this.parseIbercajaCSVWithPapa(text);
        expenses = result.expenses;
        errors = result.errors;
        console.log('[FileProcessingService] Ibercaja parsing complete. Expenses:', expenses.length, 'Errors:', errors.length);
      } else {
        console.log('[FileProcessingService] Using PapaParse for generic CSV');
        const result = await this.parseGenericCSVWithPapa(text);
        expenses = result.expenses;
        errors = result.errors;
        console.log('[FileProcessingService] Generic parsing complete. Expenses:', expenses.length, 'Errors:', errors.length);
      }

      const result = {
        expenses,
        errors,
        metadata: {
          totalRows: expenses.length + errors.length,
          validRows: expenses.length,
          invalidRows: errors.length,
          fileType: 'csv' as const,
          bankFormat
        }
      };

      console.log('[FileProcessingService] CSV processing completed successfully');
      return result;
    } catch (error) {
      console.error('[FileProcessingService] Error in processCSV:', error);
      throw new Error(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseGenericCSVWithPapa(csvText: string): Promise<{ expenses: Expense[]; errors: string[] }> {
    console.log('[FileProcessingService] Starting generic CSV parsing with PapaParse');
    const expenses: Expense[] = [];
    const errors: string[] = [];

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            console.log('[FileProcessingService] PapaParse completed. Total rows:', results.data.length);

            if (results.errors && results.errors.length > 0) {
              console.warn('[FileProcessingService] PapaParse warnings:', results.errors);
            }

            // Process data rows
            const rows = results.data as any[];
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              if (!row || Object.keys(row).length === 0) {
                continue; // Skip empty rows
              }

              try {
                const expense = this.parseGenericExpenseRow(row);
                if (expense) {
                  expenses.push(expense);
                }
              } catch (error) {
                const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`;
                errors.push(errorMsg);
              }
            }

            console.log('[FileProcessingService] Generic parsing summary - Total rows processed:', rows.length, 'Valid expenses:', expenses.length, 'Errors:', errors.length);
            resolve({ expenses, errors });
          } catch (error) {
            const errorMsg = `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('[FileProcessingService] Exception in parseGenericCSVWithPapa:', error);
            errors.push(errorMsg);
            resolve({ expenses, errors });
          }
        },
        error: (error: any) => {
          console.error('[FileProcessingService] PapaParse error:', error);
          errors.push(`PapaParse error: ${error.message}`);
          resolve({ expenses, errors });
        }
      });
    });
  }

  private detectBankFormat(csvText: string): string {
    const lines = csvText.split('\n');

    // Check for Ibercaja format
    if (lines.length > 2) {
      // Look for Ibercaja-specific patterns
      if (lines[2] && lines[2].includes('Consulta Movimientos de la Cuenta')) {
        return 'ibercaja';
      }
      if (lines[6] && lines[6].includes('Nº Orden') && lines[6].includes('Fecha Oper')) {
        return 'ibercaja';
      }
    }

    return 'generic';
  }

  private async parseIbercajaCSVWithPapa(csvText: string): Promise<{ expenses: Expense[]; errors: string[] }> {
    console.log('[FileProcessingService] Starting Ibercaja CSV parsing with PapaParse');
    const expenses: Expense[] = [];
    const errors: string[] = [];

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        delimiter: ';', // Ibercaja uses semicolons
        header: false, // We'll handle headers manually
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
        complete: (results) => {
          try {
            console.log('[FileProcessingService] PapaParse completed. Total rows:', results.data.length);

            if (results.errors && results.errors.length > 0) {
              console.warn('[FileProcessingService] PapaParse warnings:', results.errors);
            }

            // Find the header row
            let headerIndex = -1;
            for (let i = 0; i < results.data.length; i++) {
              const row = results.data[i] as string[];
              if (row && row.length > 0 && row.some(cell => cell && cell.includes('Nº Orden'))) {
                headerIndex = i;
                console.log('[FileProcessingService] Found header at row:', i);
                break;
              }
            }

            if (headerIndex === -1) {
              errors.push('Could not find header line in Ibercaja CSV format');
              resolve({ expenses, errors });
              return;
            }

            // Process data rows
            for (let i = headerIndex + 1; i < results.data.length; i++) {
              const row = results.data[i] as string[];
              if (!row || row.length === 0 || row.every(cell => !cell || cell.trim() === '')) {
                continue; // Skip empty rows
              }

              try {
                const expense = this.parseIbercajaRow(row);
                if (expense) {
                  expenses.push(expense);
                }
              } catch (error) {
                const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`;
                errors.push(errorMsg);
              }
            }

            console.log('[FileProcessingService] Ibercaja parsing summary - Total rows processed:', results.data.length - headerIndex - 1, 'Valid expenses:', expenses.length, 'Errors:', errors.length);
            resolve({ expenses, errors });
          } catch (error) {
            const errorMsg = `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error('[FileProcessingService] Exception in parseIbercajaCSVWithPapa:', error);
            errors.push(errorMsg);
            resolve({ expenses, errors });
          }
        },
        error: (error: any) => {
          console.error('[FileProcessingService] PapaParse error:', error);
          errors.push(`PapaParse error: ${error.message}`);
          resolve({ expenses, errors });
        }
      });
    });
  }

  private parseGenericExpenseRow(row: any): Expense | null {
    // This is a simple generic parser - you can enhance this based on your needs
    const date = this.parseDate(row.date || row.Date || row.transaction_date || row['Transaction Date']);
    const description = this.sanitizeText(row.description || row.Description || row.memo || row.Memo || row.details || row.Details);
    const amount = this.parseAmount(row.amount || row.Amount || row.value || row.Value || row.total || row.Total);
    const category = this.sanitizeText(row.category || row.Category || row.type || row.Type || 'Uncategorized') || 'Uncategorized';
    const currency = this.sanitizeText(row.currency || row.Currency || 'USD') || 'USD';

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
      date: date.toISOString().split('T')[0],
      description,
      amount,
      category,
      currency,
      account: this.sanitizeText(row.account || row.Account || row.account_name || row['Account Name'])
    };
  }

  private parseIbercajaRow(fields: string[]): Expense | null {
    if (fields.length < 8) {
      console.error('[FileProcessingService] Insufficient fields in row. Expected 8, got:', fields.length, 'Fields:', fields);
      throw new Error('Insufficient fields in row');
    }

    const [orderNum, fechaOper, fechaValor, concepto, descripcion, referencia, importeStr, saldo] = fields;

    // Parse date from DD-MM-YYYY to YYYY-MM-DD
    const date = this.parseIbercajaDate(fechaOper);
    if (!date) {
      throw new Error('Invalid date format');
    }

    // Parse amount (handle Spanish formatting)
    const amount = this.parseIbercajaAmount(importeStr);
    if (amount === null) {
      throw new Error('Invalid amount format');
    }

    // Create description from concepto and descripcion
    const description = this.sanitizeText(`${concepto} ${descripcion}`.trim());
    if (!description) {
      throw new Error('Missing description');
    }

    // Determine category based on concepto
    const category = this.mapIbercajaCategory(concepto, descripcion);

    return {
      date: date.toISOString().split('T')[0],
      description,
      amount,
      category,
      currency: 'EUR', // Ibercaja is Spanish bank, uses EUR
      account: 'Ibercaja', // Default account name
      tags: this.extractIbercajaTags(referencia)
    };
  }

  private parseIbercajaDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Ibercaja format: DD-MM-YYYY
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) return null;

    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  private parseIbercajaAmount(amountStr: string): number | null {
    if (!amountStr) return null;

    try {
      // Remove quotes and clean the string
      let cleanAmount = amountStr.replace(/"/g, '').trim();

      // Handle Spanish number formatting (comma as decimal separator)
      cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.');

      const amount = parseFloat(cleanAmount);
      return isNaN(amount) ? null : amount;
    } catch {
      return null;
    }
  }

  private mapIbercajaCategory(concepto: string, descripcion: string): string {
    // Leave all transactions as uncategorized
    return 'Uncategorized';
  }

  private extractIbercajaTags(referencia: string): string[] | undefined {
    if (!referencia || referencia.trim() === '') return undefined;

    const tags: string[] = [];

    // Extract useful information from reference
    if (referencia.includes('BIZUM')) {
      tags.push('bizum');
    }
    if (referencia.includes('TRANSFERENCIA')) {
      tags.push('transfer');
    }
    if (referencia.match(/\d{8,}/)) {
      tags.push('reference');
    }

    return tags.length > 0 ? tags : undefined;
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
