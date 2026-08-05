import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Category,
  CategoryService
} from '../../services/category.service';

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

  categories: Category[] = [];
  filteredCategories: Category[] = [];

  selectedType: 'income' | 'expense' = 'expense';

  form: Category = {
    name: '',
    type: 'expense',
    description: ''
  };

  editingId = '';

  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {

    this.categoryService.getCategories().subscribe({

      next: (response: any) => {

        this.categories = (response.categories || []).map((category: Category) => ({
          ...category,
          description:
            category.description?.trim()
              ? category.description
              : 'Auto-created from Transaction'
        }));

        this.filterCategories();

      },

      error: error => {

        console.error(error);

        this.showMessage(
          'Unable to load categories.',
          'error'
        );

      }

    });

  }

  filterCategories(): void {

    this.filteredCategories =
      this.categories.filter(
        category => category.type === this.selectedType
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

    const payload: Category = {

      ...this.form,

      name,

description:
  (this.form.description ?? '').trim() ||
  'Created manually'
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

            this.categories.push({
              ...category,
              description:
  (category.description ?? '').trim() ||
  'Created manually'
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