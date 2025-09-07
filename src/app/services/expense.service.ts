import { Injectable } from '@angular/core';
import { SupabaseConfig } from './supabase.config';
import { Expense, ExpenseImportResult } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(private supabaseConfig: SupabaseConfig) {}

  async importExpenses(expenses: Expense[]): Promise<ExpenseImportResult> {
    console.log('[ExpenseService] Starting import of', expenses.length, 'expenses');
    console.log('[ExpenseService] First expense sample:', expenses[0]);

    try {
      console.log('[ExpenseService] Calling Supabase insert...');
      const { data, error } = await this.supabaseConfig.client
        .from('expenses')
        .insert(expenses);

      if (error) {
        console.error('[ExpenseService] Supabase error:', error);
        return {
          success: false,
          errors: [error.message],
          totalProcessed: expenses.length,
          totalImported: 0
        };
      }

      console.log('[ExpenseService] Supabase insert successful. Inserted', expenses.length, 'expenses');
      return {
        success: true,
        data: expenses, // Return the original data since we don't get it back from insert
        totalProcessed: expenses.length,
        totalImported: expenses.length
      };
    } catch (error) {
      console.error('[ExpenseService] Exception in importExpenses:', error);
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

  async getUncategorizedExpenses(limit = 10): Promise<{ data: Expense[] | null; error: string | null }> {
    try {
      const { data, error } = await this.supabaseConfig.client
        .from('expenses')
        .select('*')
        .or('category.is.null,category.eq.,category.eq.Uncategorized')
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching uncategorized expenses:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Exception in getUncategorizedExpenses:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
