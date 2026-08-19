import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Category,
  CategoryService
} from '../../services/category.service';

const DEFAULT_CATEGORY_NAMES = new Set([
  // Income
  'salary',
  'freelance',
  'investments',
  'investment',
  'business income',
  'business',
  'refunds & reimbursements',
  'refunds',
  'reimbursements',
  'rental income',
  'rental',
  'other income',
  'other',
  // Expense
  'rent / housing',
  'rent',
  'housing',
  'food & dining',
  'food',
  'dining',
  'groceries',
  'utilities',
  'transportation',
  'transport',
  'travel',
  'entertainment',
  'healthcare',
  'health',
  'medical',
  'shopping',
  'education',
  'personal care',
  'bills & fees',
  'bills',
  'other expense'
]);

const BUILTIN_DEFAULT_CATEGORIES: Category[] = [
  // Income
  { name: 'Salary', type: 'income', description: 'Default', isDefault: true },
  { name: 'Freelance', type: 'income', description: 'Default', isDefault: true },
  { name: 'Investments', type: 'income', description: 'Default', isDefault: true },
  { name: 'Business Income', type: 'income', description: 'Default', isDefault: true },
  { name: 'Rental Income', type: 'income', description: 'Default', isDefault: true },
  { name: 'Refunds & Reimbursements', type: 'income', description: 'Default', isDefault: true },
  { name: 'Other Income', type: 'income', description: 'Default', isDefault: true },
  // Expense
  { name: 'Rent / Housing', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Food & Dining', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Utilities', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Transportation', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Entertainment', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Healthcare', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Shopping', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Other Expense', type: 'expense', description: 'Default', isDefault: true }
];

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  categories: Category[] = [...BUILTIN_DEFAULT_CATEGORIES];
  filteredCategories: Category[] = BUILTIN_DEFAULT_CATEGORIES.filter(c => c.type === 'income');

  selectedType: 'income' | 'expense' = 'income';

  form: Category = {
    name: '',
    type: 'income',
    description: ''
  };

  editingId = '';

  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.selectedType = 'income';
    this.form.type = 'income';
    this.categories = [...BUILTIN_DEFAULT_CATEGORIES];
    this.filterCategories();
    this.loadCategories();
  }

  isDefaultCategory(category: Category | { name: string; description?: string; isDefault?: boolean }): boolean {
    if (category.isDefault === true) return true;
    if (category.description?.trim().toLowerCase() === 'default') return true;
    const normalizedName = (category.name || '').trim().toLowerCase();
    return DEFAULT_CATEGORY_NAMES.has(normalizedName);
  }

  loadCategories(): void {

    this.categoryService.getCategories().subscribe({

      next: (response: any) => {

        const rawList = Array.isArray(response)
          ? response
          : (response?.categories || response?.data || []);

        const fetched: Category[] = rawList.map((category: any) => {
          const type = ((category.type || 'income') + '').trim().toLowerCase() as 'income' | 'expense';
          const isDef = this.isDefaultCategory(category);
          return {
            ...category,
            type,
            isDefault: isDef,
            description: isDef
              ? 'Default'
              : (category.description?.trim() || 'User Custom Category')
          };
        });

        const existingKeys = new Set(
          fetched.map(c => `${c.type}:${c.name.trim().toLowerCase()}`)
        );

        const missingDefaults = BUILTIN_DEFAULT_CATEGORIES.filter(
          d => !existingKeys.has(`${d.type}:${d.name.trim().toLowerCase()}`)
        );

        this.categories = [...fetched, ...missingDefaults];
        this.filterCategories();

      },

      error: error => {

        console.error(error);

        this.categories = [...BUILTIN_DEFAULT_CATEGORIES];
        this.filterCategories();

      }

    });

  }

  filterCategories(): void {

    const targetType = (this.selectedType || 'income').toLowerCase().trim();

    this.filteredCategories =
      this.categories.filter(
        category => (category.type || '').toLowerCase().trim() === targetType
      );

  }

  changeType(type: 'income' | 'expense'): void {

    this.selectedType = type;

    this.form.type = type;

    this.filterCategories();

  }

  saveCategory(): void {

    const name = this.formatCategoryName(
      this.form.name
    );

    if (!name) {
      return;
    }

    const duplicate = this.categories.find(category =>
      category.type === this.form.type &&
      category.name.toLowerCase() === name.toLowerCase() &&
      category._id !== this.editingId
    );

    if (duplicate) {

      this.showMessage(
        'Category already exists.',
        'error'
      );

      return;

    }

    const isDef = this.isDefaultCategory({
      name,
      description: this.form.description,
      isDefault: this.form.isDefault
    });

    const payload: Category = {

      ...this.form,

      name,

      isDefault: isDef,

      description: isDef
        ? 'Default'
        : ((this.form.description ?? '').trim() || 'User Custom Category')
    };

    if (this.editingId) {

      this.categoryService
        .updateCategory(
          this.editingId,
          payload
        )
        .subscribe({

          next: () => {

            const index = this.categories.findIndex(
              c => c._id === this.editingId
            );

            if (index !== -1) {

              this.categories[index] = {
                ...this.categories[index],
                ...payload
              };

            }

            this.filterCategories();

            this.resetForm();

            this.showMessage(
              'Category updated successfully.',
              'success'
            );

          },

          error: () => {

            this.showMessage(
              'Unable to update category.',
              'error'
            );

          }

        });

    } else {

      this.categoryService
        .addCategory(payload)
        .subscribe({

          next: (response: any) => {

            const category =
              response.category ??
              response.data ??
              payload;

            const isCreatedDef = this.isDefaultCategory(category);

            this.categories.push({
              ...category,
              isDefault: isCreatedDef,
              description: isCreatedDef
                ? 'Default'
                : ((category.description ?? '').trim() || 'User Custom Category')
            });

            this.filterCategories();

            this.resetForm();

            this.showMessage(
              'Category added successfully.',
              'success'
            );

          },

          error: () => {

            this.showMessage(
              'Unable to add category.',
              'error'
            );

          }

        });

    }

  }

  editCategory(category: Category): void {

    if (this.isDefaultCategory(category)) {
      this.showMessage('Default categories cannot be edited.', 'error');
      return;
    }

    this.editingId =
      category._id || '';

    this.form = {
      ...category
    };

    this.selectedType =
      category.type;

    this.filterCategories();

  }

  deleteCategory(id: string): void {

    const target = this.categories.find(c => c._id === id);
    if (target && this.isDefaultCategory(target)) {
      this.showMessage('Default categories cannot be deleted.', 'error');
      return;
    }

    if (!confirm('Delete this category?')) {
      return;
    }

    this.categoryService
      .deleteCategory(id)
      .subscribe({

        next: () => {

          this.categories =
            this.categories.filter(
              category => category._id !== id
            );

          this.filterCategories();

          this.showMessage(
            'Category deleted successfully.',
            'success'
          );

        },

        error: () => {

          this.showMessage(
            'Unable to delete category.',
            'error'
          );

        }

      });

  }

  resetForm(): void {

    this.editingId = '';

    this.form = {

      name: '',

      type: this.selectedType,

      description: ''

    };

  }

  private formatCategoryName(name: string): string {

    return name
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, letter => letter.toUpperCase());

  }

  private showMessage(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.message = message;

    this.messageType = type;

    setTimeout(() => {

      this.message = '';

    }, 3000);

  }

}