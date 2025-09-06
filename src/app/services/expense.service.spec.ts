import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ExpenseService } from './expense.service';
import { SupabaseConfig } from './supabase.config';
import { Expense, ExpenseImportResult } from '../models/expense.model';

// Mock the Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn()
    }))
  }))
};

// Mock the SupabaseConfig
const mockSupabaseConfig = {
  client: mockSupabaseClient
} as unknown as SupabaseConfig;

describe('ExpenseService', () => {
  let service: ExpenseService;
  let mockInsert: Mock;
  let mockSelect: Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Create fresh service instance with mocked dependencies
    service = new ExpenseService(mockSupabaseConfig);
    
    // Set up the mock chain
    mockInsert = vi.fn();
    mockSelect = vi.fn();
    
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert
    });
    
    mockInsert.mockReturnValue({
      select: mockSelect
    });
  });

  describe('importExpenses', () => {
    const mockExpenses: Expense[] = [
      {
        id: '1',
        date: '2024-01-15',
        description: 'Coffee',
        amount: 4.50,
        category: 'Food',
        currency: 'USD',
        account: 'Checking'
      },
      {
        id: '2',
        date: '2024-01-16',
        description: 'Gas',
        amount: 45.00,
        category: 'Transportation',
        currency: 'USD',
        account: 'Credit Card'
      }
    ];

    it('should successfully import expenses when Supabase returns data', async () => {
      // Arrange
      const mockSupabaseResponse = {
        data: mockExpenses,
        error: null
      };
      mockInsert.mockResolvedValue(mockSupabaseResponse);

      // Act
      const result: ExpenseImportResult = await service.importExpenses(mockExpenses);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockExpenses,
        totalProcessed: 2,
        totalImported: 2
      });

      // Verify Supabase was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('expenses');
      expect(mockInsert).toHaveBeenCalledWith(mockExpenses);
    });

    it('should handle Supabase error response', async () => {
      // Arrange
      const mockError = {
        message: 'Database connection failed',
        code: 'PGRST301'
      };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };
      mockInsert.mockResolvedValue(mockSupabaseResponse);

      // Act
      const result: ExpenseImportResult = await service.importExpenses(mockExpenses);

      // Assert
      expect(result).toEqual({
        success: false,
        errors: ['Database connection failed'],
        totalProcessed: 2,
        totalImported: 0
      });
    });

    it('should handle exception during Supabase call', async () => {
      // Arrange
      const mockError = new Error('Network timeout');
      mockInsert.mockRejectedValue(mockError);

      // Act
      const result: ExpenseImportResult = await service.importExpenses(mockExpenses);

      // Assert
      expect(result).toEqual({
        success: false,
        errors: ['Network timeout'],
        totalProcessed: 2,
        totalImported: 0
      });
    });

    it('should handle non-Error exception', async () => {
      // Arrange
      const mockError = 'String error';
      mockInsert.mockRejectedValue(mockError);

      // Act
      const result: ExpenseImportResult = await service.importExpenses(mockExpenses);

      // Assert
      expect(result).toEqual({
        success: false,
        errors: ['Unknown error'],
        totalProcessed: 2,
        totalImported: 0
      });
    });

    it('should handle empty expenses array', async () => {
      // Arrange
      const emptyExpenses: Expense[] = [];
      const mockSupabaseResponse = {
        data: [],
        error: null
      };
      mockInsert.mockResolvedValue(mockSupabaseResponse);

      // Act
      const result: ExpenseImportResult = await service.importExpenses(emptyExpenses);

      // Assert
      expect(result).toEqual({
        success: true,
        data: [],
        totalProcessed: 0,
        totalImported: 0
      });

      expect(mockInsert).toHaveBeenCalledWith([]);
    });

    it('should handle null data response from Supabase', async () => {
      // Arrange
      const mockSupabaseResponse = {
        data: null,
        error: null
      };
      mockInsert.mockResolvedValue(mockSupabaseResponse);

      // Act
      const result: ExpenseImportResult = await service.importExpenses(mockExpenses);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockExpenses,
        totalProcessed: 2,
        totalImported: 2
      });
    });

    it('should handle undefined data response from Supabase', async () => {
      // Arrange
      const mockSupabaseResponse = {
        data: undefined,
        error: null
      };
      mockInsert.mockResolvedValue(mockSupabaseResponse);

      // Act
      const result: ExpenseImportResult = await service.importExpenses(mockExpenses);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockExpenses,
        totalProcessed: 2,
        totalImported: 2
      });
    });

    it('should handle partial success with some expenses imported', async () => {
      // Arrange
      const partialData = [mockExpenses[0]]; // Only first expense imported
      const mockSupabaseResponse = {
        data: partialData,
        error: null
      };
      mockInsert.mockResolvedValue(mockSupabaseResponse);

      // Act
      const result: ExpenseImportResult = await service.importExpenses(mockExpenses);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockExpenses,
        totalProcessed: 2,
        totalImported: 2
      });
    });

    it('should log appropriate messages during successful import', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockSupabaseResponse = {
        data: mockExpenses,
        error: null
      };
      mockInsert.mockResolvedValue(mockSupabaseResponse);

      // Act
      await service.importExpenses(mockExpenses);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('[ExpenseService] Starting import of', 2, 'expenses');
      expect(consoleSpy).toHaveBeenCalledWith('[ExpenseService] First expense sample:', mockExpenses[0]);
      expect(consoleSpy).toHaveBeenCalledWith('[ExpenseService] Calling Supabase insert...');
      expect(consoleSpy).toHaveBeenCalledWith('[ExpenseService] Supabase insert successful. Inserted', 2, 'expenses');

      consoleSpy.mockRestore();
    });

    it('should log error messages when Supabase returns error', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = {
        message: 'Validation failed',
        code: 'PGRST116'
      };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };
      mockInsert.mockResolvedValue(mockSupabaseResponse);

      // Act
      await service.importExpenses(mockExpenses);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ExpenseService] Supabase error:', mockError);

      consoleErrorSpy.mockRestore();
    });

    it('should log exception messages when exception occurs', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Connection lost');
      mockInsert.mockRejectedValue(mockError);

      // Act
      await service.importExpenses(mockExpenses);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ExpenseService] Exception in importExpenses:', mockError);

      consoleErrorSpy.mockRestore();
    });
  });
});