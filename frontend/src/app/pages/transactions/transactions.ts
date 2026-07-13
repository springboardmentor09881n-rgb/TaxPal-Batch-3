import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  Transaction,
  TransactionService
} from '../../services/transaction';

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

  errorMessage = '';
  successMessage = '';

  isLoading = false;
  isSubmitting = false;

  transactionForm;

  constructor(
    private formBuilder: FormBuilder,
    private transactionService: TransactionService
  ) {
    this.transactionForm = this.formBuilder.nonNullable.group({
      type: ['expense' as 'income' | 'expense', Validators.required],

      amount: [0, [
        Validators.required,
        Validators.min(0.01)
      ]],

      category: ['', Validators.required],

      description: [''],

      date: [
        new Date().toISOString().split('T')[0],
        Validators.required
      ]
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService.getTransactions().subscribe({
      next: response => {
        this.transactions = response.transactions;
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

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.transactionService
      .createTransaction(this.transactionForm.getRawValue())
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
        },

        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to add transaction.';
        }
      });
  }

  deleteTransaction(id: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    const confirmed = window.confirm(
      'Are you sure you want to delete this transaction?'
    );

    if (!confirmed) {
      return;
    }

    this.transactionService.deleteTransaction(id).subscribe({
      next: () => {
        this.transactions = this.transactions.filter(
          transaction => transaction._id !== id
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