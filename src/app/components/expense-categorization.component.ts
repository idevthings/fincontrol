import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Expense } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';
import { CATEGORIES, Category } from '../config/categories.config';
import { SUBCATEGORIES, Subcategory, getSubcategoriesByCategory } from '../config/subcategories.config';

@Component({
  selector: 'app-expense-categorization',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './expense-categorization.component.html',
  styleUrl: './expense-categorization.component.css'
})
export class ExpenseCategorizationComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private snackBar = inject(MatSnackBar);

  // State signals
  currentExpense = signal<Expense | null>(null);
  selectedCategory = signal<Category | null>(null);
  selectedSubcategory = signal<Subcategory | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  showCategorySelection = signal(false);
  showSubcategorySelection = signal(false);

  // Computed values
  availableSubcategories = computed(() => {
    // Return all subcategories regardless of selected category
    return this.subcategories;
  });

  isReadyToSave = computed(() => {
    return this.selectedCategory() && this.selectedSubcategory();
  });

  // Data
  categories = CATEGORIES;
  subcategories = SUBCATEGORIES;

  ngOnInit() {
    this.loadNextUncategorizedExpense();
  }

  async loadNextUncategorizedExpense() {
    this.isLoading.set(true);
    try {
      // Get expenses where category is empty or null
      const { data, error } = await this.expenseService.getUncategorizedExpenses(1);
      
      if (error) {
        this.snackBar.open('Error loading expenses: ' + error, 'Close', { duration: 3000 });
        return;
      }

      if (data && data.length > 0) {
        this.currentExpense.set(data[0]);
        this.resetSelections();
      } else {
        this.currentExpense.set(null);
        this.snackBar.open('No uncategorized expenses found!', 'Close', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Error loading expenses', 'Close', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  resetSelections() {
    this.selectedCategory.set(null);
    this.selectedSubcategory.set(null);
    this.showCategorySelection.set(false);
    this.showSubcategorySelection.set(false);
  }

  onCategoryClick() {
    this.showCategorySelection.set(true);
    this.showSubcategorySelection.set(false);
  }

  onSubcategoryClick() {
    this.showSubcategorySelection.set(true);
    this.showCategorySelection.set(false);
  }

  selectCategory(category: Category) {
    this.selectedCategory.set(category);
    this.selectedSubcategory.set(null); // Reset subcategory when category changes
    this.showCategorySelection.set(false);
  }

  selectSubcategory(subcategory: Subcategory) {
    this.selectedSubcategory.set(subcategory);
    this.showSubcategorySelection.set(false);
  }

  async saveCategorization() {
    const expense = this.currentExpense();
    const category = this.selectedCategory();
    const subcategory = this.selectedSubcategory();

    if (!expense || !category || !subcategory) {
      return;
    }

    this.isSaving.set(true);
    try {
      const success = await this.expenseService.updateExpense(expense.id!, {
        category: category.id,
        subcategory: subcategory.id
      });

      if (success) {
        this.snackBar.open('Expense categorized successfully!', 'Close', { duration: 2000 });
        // Load next uncategorized expense
        await this.loadNextUncategorizedExpense();
      } else {
        this.snackBar.open('Error saving categorization', 'Close', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Error saving categorization', 'Close', { duration: 3000 });
    } finally {
      this.isSaving.set(false);
    }
  }

  skipExpense() {
    this.loadNextUncategorizedExpense();
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  getSubcategoryById(id: string): Subcategory | undefined {
    return this.subcategories.find(sub => sub.id === id);
  }

}
