import { Injectable } from '@angular/core';
import { SupabaseConfig } from './supabase.config';
import { Expense, ExpenseImportResult } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(private supabaseConfig: SupabaseConfig) {}

  async importExpenses(expenses: Expense[]): Promise<ExpenseImportResult> {
    try {
      const { data, error } = await this.supabaseConfig.client
        .from('expenses')
        .insert(expenses)
        .select();

      if (error) {
        return {
          success: false,
          errors: [error.message],
          totalProcessed: expenses.length,
          totalImported: 0
        };
      }

      return {
        success: true,
        data: data || [],
        totalProcessed: expenses.length,
        totalImported: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        totalProcessed: expenses.length,
        totalImported: 0
      };
    }
  }

  async getExpenses(limit = 100, offset = 0): Promise<Expense[]> {
    const { data, error } = await this.supabaseConfig.client
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }

    return data || [];
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    const { data, error } = await this.supabaseConfig.client
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching expense:', error);
      return null;
    }

    return data;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<boolean> {
    const { error } = await this.supabaseConfig.client
      .from('expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating expense:', error);
      return false;
    }

    return true;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const { error } = await this.supabaseConfig.client
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      return false;
    }

    return true;
  }
}
