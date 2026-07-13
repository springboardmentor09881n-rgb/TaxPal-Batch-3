import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import {
  Transaction,
  TransactionService
} from '../../services/transaction';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  transactions: Transaction[] = [];
  recentTransactions: Transaction[] = [];

  totalIncome = 0;
  totalExpenses = 0;
  currentBalance = 0;

  isLoading = false;
  errorMessage = '';

  constructor(
    private transactionService: TransactionService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService.getTransactions().subscribe({
      next: response => {
        this.transactions = response.transactions;

        this.calculateSummary();

        this.recentTransactions =
          this.transactions.slice(0, 5);

        this.isLoading = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to load dashboard data.';

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  private calculateSummary(): void {
    this.totalIncome = this.transactions
      .filter(transaction => transaction.type === 'income')
      .reduce(
        (total, transaction) => total + transaction.amount,
        0
      );

    this.totalExpenses = this.transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce(
        (total, transaction) => total + transaction.amount,
        0
      );

    this.currentBalance =
      this.totalIncome - this.totalExpenses;
  }

  trackTransaction(
    index: number,
    transaction: Transaction
  ): string {
    return transaction._id;
  }
}