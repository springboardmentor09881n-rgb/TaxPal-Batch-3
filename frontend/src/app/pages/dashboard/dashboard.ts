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

export interface ExpenseChartItem {
  category: string;
  amount: number;
  percentage: number;
  barWidth: number;
}

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

  expenseChart: ExpenseChartItem[] = [];

  totalIncome = 0;
  totalExpenses = 0;
  currentBalance = 0;

  incomePercentage = 0;
  expensePercentage = 0;

  donutGradient =
    'conic-gradient(#e2e8f0 0deg 360deg)';

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

    this.transactionService
      .getTransactions()
      .subscribe({
        next: response => {
          this.transactions =
            response.transactions;

          this.calculateSummary();
          this.calculateExpenseChart();
          this.calculateDonutChart();

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
      .filter(
        transaction =>
          transaction.type === 'income'
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );

    this.totalExpenses = this.transactions
      .filter(
        transaction =>
          transaction.type === 'expense'
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );

    this.currentBalance =
      this.totalIncome - this.totalExpenses;
  }

  private calculateExpenseChart(): void {
    const categoryTotals =
      new Map<string, number>();

    this.transactions
      .filter(
        transaction =>
          transaction.type === 'expense'
      )
      .forEach(transaction => {
        const category =
          transaction.category.trim() || 'Other';

        const normalizedCategory =
          category.toLowerCase();

        const currentAmount =
          categoryTotals.get(normalizedCategory) || 0;

        categoryTotals.set(
          normalizedCategory,
          currentAmount + transaction.amount
        );
      });

    const chartItems = Array.from(
      categoryTotals.entries()
    ).map(([category, amount]) => ({
      category: this.formatCategory(category),
      amount
    }));

    chartItems.sort(
      (first, second) =>
        second.amount - first.amount
    );

    const maximumAmount =
      chartItems.length > 0
        ? Math.max(
            ...chartItems.map(
              item => item.amount
            )
          )
        : 0;

    this.expenseChart =
      chartItems.map(item => ({
        category: item.category,

        amount: item.amount,

        percentage:
          this.totalExpenses > 0
            ? (
                item.amount /
                this.totalExpenses
              ) * 100
            : 0,

        barWidth:
          maximumAmount > 0
            ? (
                item.amount /
                maximumAmount
              ) * 100
            : 0
      }));
  }

  private calculateDonutChart(): void {
    const totalCashFlow =
      this.totalIncome + this.totalExpenses;

    if (totalCashFlow <= 0) {
      this.incomePercentage = 0;
      this.expensePercentage = 0;

      this.donutGradient =
        'conic-gradient(#e2e8f0 0deg 360deg)';

      return;
    }

    this.incomePercentage =
      (
        this.totalIncome /
        totalCashFlow
      ) * 100;

    this.expensePercentage =
      (
        this.totalExpenses /
        totalCashFlow
      ) * 100;

    const incomeDegrees =
      (
        this.incomePercentage /
        100
      ) * 360;

    this.donutGradient =
      `conic-gradient(
        #16a34a 0deg ${incomeDegrees}deg,
        #dc2626 ${incomeDegrees}deg 360deg
      )`;
  }

  private formatCategory(
    category: string
  ): string {
    return category
      .split(' ')
      .filter(word => word.length > 0)
      .map(
        word =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  }

  trackTransaction(
    index: number,
    transaction: Transaction
  ): string {
    return transaction._id;
  }

  trackExpenseItem(
    index: number,
    item: ExpenseChartItem
  ): string {
    return item.category;
  }
}