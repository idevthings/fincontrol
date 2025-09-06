export interface Expense {
  id?: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  currency: string;
  account?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseImportResult {
  success: boolean;
  data?: Expense[];
  errors?: string[];
  totalProcessed: number;
  totalImported: number;
}

export interface FileProcessingResult {
  expenses: Expense[];
  errors: string[];
  metadata: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    fileType: 'csv' | 'json';
    bankFormat?: string;
  };
}
