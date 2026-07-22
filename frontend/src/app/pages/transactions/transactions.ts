import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Transaction,
  TransactionService
} from '../../services/transaction';

import {
  Category,
  CategoryService,
  CategoryListResponse
} from '../../services/category.service';

@Component({
  selector: 'app-transactions',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions implements OnInit {

  transactions: Transaction[] = [];

  categories: Category[] = [];

  suggestedCategories: string[] = [];

  errorMessage = '';
  successMessage = '';

  isLoading = false;
  isSubmitting = false;

  transactionForm;

  constructor(
    private formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {

    this.transactionForm = this.formBuilder.nonNullable.group({

      type: [
        'expense' as 'income' | 'expense',
        Validators.required
      ],

      amount: [
        0,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      category: [
        '',
        Validators.required
      ],

      description: [''],

      date: [
        new Date().toISOString().split('T')[0],
        Validators.required
      ]

    });

  }

  ngOnInit(): void {

    this.loadTransactions();

    this.loadCategories();

  }

  loadTransactions(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService
      .getTransactions()
      .subscribe({

        next: response => {

          this.transactions =
            response.transactions;

          this.isLoading = false;

        },

        error: (error: HttpErrorResponse) => {

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load transactions.';

        }

      });

  }

  loadCategories(): void {

    this.categoryService
      .getCategories()
      .subscribe({

        next: (response: CategoryListResponse) => {

          this.categories =
            response.categories;

          const type =
            this.transactionForm.controls.type.value;

          this.updateSuggestedCategories(type);

        },

        error: error => {

          console.error(
            'Unable to load categories',
            error
          );

        }

      });

  }

  onTypeChange(): void {

    const type =
      this.transactionForm.controls.type.value;

    this.updateSuggestedCategories(type);

    this.transactionForm.controls.category.setValue('');

    this.successMessage = '';

  }

  private updateSuggestedCategories(
    type: 'income' | 'expense'
  ): void {

    this.suggestedCategories =
      this.categories
        .filter(category => category.type === type)
        .map(category => category.name);

  }

  onSuggestedCategoryChange(
    event: Event
  ): void {

    const value =
      (event.target as HTMLSelectElement).value;

    if (value) {

      this.transactionForm.controls.category.setValue(value);

      this.transactionForm.controls.category.markAsTouched();

    }

  }

  onSubmit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.transactionForm.invalid) {

      this.transactionForm.markAllAsTouched();

      return;

    }

    this.isSubmitting = true;

    const formData =
      this.transactionForm.getRawValue();

    const categoryName =
      formData.category.trim();

    const categoryExists =
      this.categories.some(category =>

        category.type === formData.type &&

        category.name.toLowerCase() ===
        categoryName.toLowerCase()

      );

    if (categoryExists) {

      this.saveTransaction(formData);

      return;

    }

  const formattedCategory =
  categoryName
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, letter => letter.toUpperCase());

this.categoryService
  .addCategory({

    name: formattedCategory,

    type: formData.type,

    description: 'Auto-created from Transaction'

  })
  .subscribe({

    next: (response: any) => {

      const createdCategory =
        response.category ?? {
          name: formattedCategory,
          type: formData.type,
          description: 'Auto-created from Transaction'
        };

      this.categories.push(createdCategory);

      this.updateSuggestedCategories(formData.type);

      formData.category = formattedCategory;

      this.saveTransaction(formData);

    },


        error: (error: HttpErrorResponse) => {

          this.isSubmitting = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to create category.';

        }

      });

  }
    private saveTransaction(data: any): void {

    this.transactionService
      .createTransaction(data)
      .subscribe({

        next: response => {

          this.transactions = [
            response.transaction,
            ...this.transactions
          ];

          this.successMessage =
            'Transaction added successfully.';

          this.isSubmitting = false;

          this.transactionForm.reset({

            type: 'expense',

            amount: 0,

            category: '',

            description: '',

            date: new Date().toISOString().split('T')[0]

          });

          this.updateSuggestedCategories('expense');

        },

        error: (error: HttpErrorResponse) => {

          this.isSubmitting = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to add transaction.';

        }

      });

  }

  deleteTransaction(
    id: string
  ): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !window.confirm(
        'Are you sure you want to delete this transaction?'
      )
    ) {

      return;

    }

    this.transactionService
      .deleteTransaction(id)
      .subscribe({

        next: () => {

          this.transactions =
            this.transactions.filter(
              transaction =>
                transaction._id !== id
            );

          this.successMessage =
            'Transaction deleted successfully.';

        },

        error: (error: HttpErrorResponse) => {

          this.errorMessage =
            error.error?.message ||
            'Unable to delete transaction.';

        }

      });

  }

  trackTransaction(
    index: number,
    transaction: Transaction
  ): string {

    return transaction._id;

  }

}