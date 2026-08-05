import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import {
  Budget,
  BudgetService
} from '../../services/budget';

import {
  Transaction,
  TransactionService
} from '../../services/transaction';

import {
  Category,
  CategoryService
} from '../../services/category.service';

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  progressWidth: number;
  isOverBudget: boolean;
}

export interface SpendingChartItem {
  category: string;
  amount: number;
  percentage: number;
  barWidth: number;
}

@Component({
  selector: 'app-budgets',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './budgets.html',
  styleUrl: './budgets.css'
})
export class Budgets implements OnInit {
  budgets: Budget[] = [];
  transactions: Transaction[] = [];

  budgetProgress: BudgetProgress[] = [];
  spendingChart: SpendingChartItem[] = [];

  totalMonthlySpending = 0;

  categories: string[] = [];

  readonly months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  readonly years: number[];

  isLoading = false;
  isSaving = false;
  editingBudgetId: string | null = null;

  errorMessage = '';
  successMessage = '';

  budgetForm;

  constructor(
    private formBuilder: FormBuilder,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    this.years = [
      currentYear - 1,
      currentYear,
      currentYear + 1,
      currentYear + 2
    ];

    this.budgetForm = this.formBuilder.nonNullable.group({
      category: ['', Validators.required],

      monthlyLimit: [
        0,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      month: [
        currentDate.getMonth() + 1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(12)
        ]
      ],

      year: [
        currentYear,
        [
          Validators.required,
          Validators.min(2000)
        ]
      ]
    });
  }

  ngOnInit(): void {
    this.loadCategoriesAndBudgets();
  }

  loadCategoriesAndBudgets(): void {
    this.categoryService.getCategories().subscribe({
      next: response => {
        this.categories = (response.categories || [])
          .filter((cat: Category) => cat.type === 'expense')
          .map((cat: Category) => cat.name);
        this.loadBudgetData();
      },
      error: () => {
        this.errorMessage = 'Unable to load categories.';
        this.loadBudgetData();
      }
    });
  }

  get availableCategories(): string[] {
    const month = this.budgetForm.controls.month.value;
    const year = this.budgetForm.controls.year.value;

    const usedCategories = this.budgets
      .filter(budget => budget.month === month && budget.year === year && budget._id !== this.editingBudgetId)
      .map(budget => budget.category.toLowerCase());

    return this.categories.filter(category => !usedCategories.includes(category.toLowerCase()));
  }

  loadBudgetData(): void {
    const {
      month,
      year
    } = this.budgetForm.getRawValue();

    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      budgetsResponse:
        this.budgetService.getBudgets(month, year),

      transactionsResponse:
        this.transactionService.getTransactions()
    }).subscribe({
      next: response => {
        this.budgets =
          response.budgetsResponse.budgets;

        this.transactions =
          response.transactionsResponse.transactions;

        this.calculateBudgetProgress(month, year);
        this.calculateSpendingChart(month, year);

        const currentCategory = this.budgetForm.controls.category.value;
        if (currentCategory && !this.availableCategories.includes(currentCategory)) {
          this.budgetForm.controls.category.setValue('');
        }

        this.isLoading = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to load budget data.';

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  loadBudgets(): void {
    this.loadBudgetData();
  }

  private getMonthlyExpenses(
    month: number,
    year: number
  ): Transaction[] {
    return this.transactions.filter(transaction => {
      if (transaction.type !== 'expense') {
        return false;
      }

      const transactionDate =
        new Date(transaction.date);

      return (
        transactionDate.getMonth() + 1 === month &&
        transactionDate.getFullYear() === year
      );
    });
  }

  private calculateBudgetProgress(
    month: number,
    year: number
  ): void {
    const monthlyExpenses =
      this.getMonthlyExpenses(month, year);

    this.budgetProgress = this.budgets.map(budget => {
      const spent = monthlyExpenses
        .filter(
          transaction =>
            transaction.category
              .trim()
              .toLowerCase() ===
            budget.category
              .trim()
              .toLowerCase()
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        );

      const remaining =
        budget.monthlyLimit - spent;

      const percentage =
        budget.monthlyLimit > 0
          ? (spent / budget.monthlyLimit) * 100
          : 0;

      return {
        budget,
        spent,
        remaining,
        percentage,
        progressWidth: Math.min(percentage, 100),
        isOverBudget: spent > budget.monthlyLimit
      };
    });
  }

  private calculateSpendingChart(
    month: number,
    year: number
  ): void {
    const monthlyExpenses =
      this.getMonthlyExpenses(month, year);

    const categoryTotals = new Map<string, number>();

    monthlyExpenses.forEach(transaction => {
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
    ).map(([normalizedCategory, amount]) => {
      const matchingCategory =
        this.categories.find(
          category =>
            category.toLowerCase() === normalizedCategory
        );

      return {
        category:
          matchingCategory ||
          this.formatCategory(normalizedCategory),

        amount
      };
    });

    chartItems.sort(
      (first, second) =>
        second.amount - first.amount
    );

    this.totalMonthlySpending =
      chartItems.reduce(
        (total, item) => total + item.amount,
        0
      );

    const maximumAmount =
      chartItems.length > 0
        ? Math.max(
            ...chartItems.map(item => item.amount)
          )
        : 0;

    this.spendingChart = chartItems.map(item => ({
      category: item.category,

      amount: item.amount,

      percentage:
        this.totalMonthlySpending > 0
          ? (
              item.amount /
              this.totalMonthlySpending
            ) * 100
          : 0,

      barWidth:
        maximumAmount > 0
          ? (item.amount / maximumAmount) * 100
          : 0
    }));
  }

  private formatCategory(category: string): string {
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

  onPeriodChange(): void {
    this.successMessage = '';
    this.editingBudgetId = null;
    this.budgetForm.controls.category.setValue('');
    this.loadBudgetData();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.budgetForm.getRawValue();

    this.isSaving = true;

    const data: any = {
      category: formValue.category,
      monthlyLimit: formValue.monthlyLimit,
      month: formValue.month,
      year: formValue.year
    };

    if (this.editingBudgetId) {
      data.id = this.editingBudgetId;
    }

    this.budgetService
      .saveBudget(data)
      .subscribe({
        next: response => {
          this.isSaving = false;

          this.successMessage = response.message;

          this.editingBudgetId = null;
          this.budgetForm.controls.category.setValue('');
          this.budgetForm.controls.monthlyLimit.setValue(0);

          this.loadBudgetData();
        },

        error: (error: HttpErrorResponse) => {
          this.isSaving = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to save budget.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  editBudget(budget: Budget): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.editingBudgetId = budget._id;

    this.budgetForm.setValue({
      category: budget.category,
      monthlyLimit: budget.monthlyLimit,
      month: budget.month,
      year: budget.year
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  deleteBudget(budget: Budget): void {
    const shouldDelete = window.confirm(
      `Delete the ${budget.category} budget?`
    );

    if (!shouldDelete) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.budgetService
      .deleteBudget(budget._id)
      .subscribe({
        next: response => {
          this.successMessage = response.message;

          this.loadBudgetData();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.error?.message ||
            'Unable to delete budget.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  getMonthName(month: number): string {
    return (
      this.months.find(
        item => item.value === month
      )?.name || ''
    );
  }

  trackBudgetProgress(
    index: number,
    item: BudgetProgress
  ): string {
    return item.budget._id;
  }

  trackSpendingItem(
    index: number,
    item: SpendingChartItem
  ): string {
    return item.category;
  }
}