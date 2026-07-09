import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { AuthService } from '../../core/auth.service';
import { FinanceService } from '../../core/finance.service';
import { BrandComponent } from '../../shared/brand/brand.component';
import { ChartComponent } from '../../shared/chart/chart.component';
import { CHART_COLORS, darkChartOptions, doughnutChartOptions } from '../../shared/chart/chart.utils';
import {
  Alert,
  DashboardData,
  ReportSummary,
  SavedReport,
  SuggestedCategory,
  Transaction,
  TransactionPayload,
} from '../../core/models/finance.model';

type DashboardTab = 'overview' | 'transactions' | 'budgets' | 'tax' | 'reports' | 'categories' | 'alerts';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, BrandComponent, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly finance = inject(FinanceService);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;
  readonly activeTab = signal<DashboardTab>('overview');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  readonly monthKey = signal(this.currentMonth());
  readonly dashboard = signal<DashboardData | null>(null);
  readonly incomeCategories = signal<string[]>([]);
  readonly expenseCategories = signal<string[]>([]);
  readonly report = signal<ReportSummary | null>(null);
  readonly reportHistory = signal<SavedReport[]>([]);
  readonly reportPeriod = signal<'monthly' | 'quarterly'>('monthly');
  readonly managedCategories = signal<SuggestedCategory[]>([]);
  readonly editingTransactionId = signal<string | null>(null);

  readonly transactionForm = signal<TransactionPayload>(this.emptyTransaction('income'));
  readonly editTransactionForm = signal<TransactionPayload>(this.emptyTransaction('income'));
  readonly budgetForm = signal({ category: 'groceries', limit: 5000 });
  readonly categoryForm = signal({ name: '', type: 'expense' as 'income' | 'expense', description: '' });

  readonly tabs: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'budgets', label: 'Budgets', icon: '🎯' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'tax', label: 'Tax', icon: '🧾' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'reports', label: 'Reports', icon: '📁' },
  ];

  constructor() {
    this.finance.getCategories().subscribe({
      next: (cats) => {
        this.incomeCategories.set(cats.income);
        this.expenseCategories.set(cats.expense);
        this.transactionForm.update((form) => ({
          ...form,
          category: cats.income[0] || 'other',
        }));
        this.budgetForm.update((form) => ({
          ...form,
          category: cats.expense[0] || 'groceries',
        }));
      },
    });
    this.loadManagedCategories();
    this.loadDashboard();
  }

  setTab(tab: DashboardTab): void {
    this.activeTab.set(tab);
    this.message.set('');
    this.error.set('');
    if (tab === 'reports') {
      this.loadReport(this.reportPeriod());
      this.loadReportHistory();
    }
    if (tab === 'categories') {
      this.loadManagedCategories();
    }
    if (tab === 'alerts') {
      this.loadDashboard();
    }
  }

  loadManagedCategories(): void {
    this.finance.getManagedCategories().subscribe({
      next: (data) => {
        this.managedCategories.set(data.categories);
        this.incomeCategories.set(data.income);
        this.expenseCategories.set(data.expense);
      },
      error: () => this.error.set('Could not load categories.'),
    });
  }

  loadReportHistory(): void {
    this.finance.getReportHistory().subscribe({
      next: (data) => this.reportHistory.set(data.reports),
      error: () => this.error.set('Could not load report history.'),
    });
  }

  removeReport(id: string): void {
    this.finance.deleteReport(id).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.loadReportHistory();
      },
      error: () => this.error.set('Failed to delete report.'),
    });
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');

    this.finance.getDashboard(this.monthKey()).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load dashboard. Make sure the backend and MongoDB are running.');
        this.loading.set(false);
      },
    });
  }

  loadReport(period: 'monthly' | 'quarterly'): void {
    this.reportPeriod.set(period);
    this.finance.getReportSummary(period, this.monthKey()).subscribe({
      next: (data) => this.report.set(data),
      error: () => this.error.set('Could not load report.'),
    });
  }

  onDescriptionChange(description: string): void {
    const form = this.transactionForm();
    this.transactionForm.set({ ...form, description });
    if (description.length > 2) {
      this.finance.suggestCategory(description, form.type).subscribe({
        next: ({ category }) => {
          this.transactionForm.update((current) => ({ ...current, category }));
        },
      });
    }
  }

  setTransactionType(type: 'income' | 'expense'): void {
    const categories = type === 'income' ? this.incomeCategories() : this.expenseCategories();
    this.transactionForm.set({
      ...this.emptyTransaction(type),
      category: categories[0] || 'other',
    });
  }

  addTransaction(): void {
    const payload = this.transactionForm();
    if (!payload.amount || payload.amount <= 0) {
      this.error.set('Enter a valid amount.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.finance.addTransaction(payload).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.transactionForm.set(this.emptyTransaction(payload.type));
        this.saving.set(false);
        this.loadDashboard();
      },
      error: () => {
        this.error.set('Failed to add transaction.');
        this.saving.set(false);
      },
    });
  }

  removeTransaction(id: string): void {
    this.finance.deleteTransaction(id).subscribe({
      next: () => {
        this.message.set('Transaction removed.');
        this.loadDashboard();
      },
      error: () => this.error.set('Failed to delete transaction.'),
    });
  }

  startEditTransaction(tx: Transaction): void {
    this.editingTransactionId.set(tx._id);
    this.editTransactionForm.set({
      type: tx.type,
      category: tx.category,
      description: tx.description || '',
      amount: tx.amount,
      date: new Date(tx.date).toISOString().split('T')[0],
    });
  }

  cancelEditTransaction(): void {
    this.editingTransactionId.set(null);
  }

  saveTransactionEdit(): void {
    const id = this.editingTransactionId();
    const payload = this.editTransactionForm();
    if (!id || !payload.amount || payload.amount <= 0) {
      this.error.set('Enter a valid amount.');
      return;
    }

    this.saving.set(true);
    this.finance.updateTransaction(id, payload).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.editingTransactionId.set(null);
        this.saving.set(false);
        this.loadDashboard();
      },
      error: () => {
        this.error.set('Failed to update transaction.');
        this.saving.set(false);
      },
    });
  }

  updateEditTransactionField<K extends keyof TransactionPayload>(field: K, value: TransactionPayload[K]): void {
    this.editTransactionForm.update((form) => ({ ...form, [field]: value }));
  }

  addCategory(): void {
    const form = this.categoryForm();
    if (!form.name.trim()) {
      this.error.set('Enter a category name.');
      return;
    }

    this.saving.set(true);
    this.finance.addCategory(form).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.categoryForm.set({ name: '', type: form.type, description: '' });
        this.saving.set(false);
        this.loadManagedCategories();
        this.finance.getCategories().subscribe({
          next: (cats) => {
            this.incomeCategories.set(cats.income);
            this.expenseCategories.set(cats.expense);
          },
        });
      },
      error: () => {
        this.error.set('Failed to add category.');
        this.saving.set(false);
      },
    });
  }

  removeCategory(id: string): void {
    this.finance.deleteCategory(id).subscribe({
      next: () => {
        this.message.set('Category removed.');
        this.loadManagedCategories();
      },
      error: () => this.error.set('Failed to remove category.'),
    });
  }

  updateCategoryField(field: 'name' | 'type' | 'description', value: string): void {
    this.categoryForm.update((form) => ({
      ...form,
      [field]: value,
    }));
  }

  markAlertRead(id: string): void {
    this.finance.markAlertRead(id).subscribe({
      next: () => this.loadDashboard(),
      error: () => this.error.set('Failed to update alert.'),
    });
  }

  markAllAlertsRead(): void {
    this.finance.markAllAlertsRead().subscribe({
      next: () => {
        this.message.set('All alerts marked as read.');
        this.loadDashboard();
      },
      error: () => this.error.set('Failed to update alerts.'),
    });
  }

  unreadAlerts(data: DashboardData): Alert[] {
    return (data.alerts || []).filter((alert) => !alert.isRead);
  }

  saveBudget(): void {
    const form = this.budgetForm();
    if (!form.limit || form.limit <= 0) {
      this.error.set('Enter a valid budget limit.');
      return;
    }

    this.saving.set(true);
    this.finance.saveBudget({ ...form, month: this.monthKey() }).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.saving.set(false);
        this.loadDashboard();
      },
      error: () => {
        this.error.set('Failed to save budget.');
        this.saving.set(false);
      },
    });
  }

  removeBudget(id: string | undefined): void {
    if (!id) return;
    this.finance.deleteBudget(id).subscribe({
      next: () => {
        this.message.set('Budget removed.');
        this.loadDashboard();
      },
      error: () => this.error.set('Failed to remove budget.'),
    });
  }

  saveTaxEstimate(): void {
    this.saving.set(true);
    const tax = this.dashboard()?.tax;
    this.finance.saveTaxEstimate(tax?.quarter, tax?.fiscalYear).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.saving.set(false);
        this.loadDashboard();
      },
      error: () => {
        this.error.set('Failed to save tax estimate.');
        this.saving.set(false);
      },
    });
  }

  removeTaxEstimate(id: string): void {
    this.finance.deleteTaxEstimate(id).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.loadDashboard();
      },
      error: () => this.error.set('Failed to delete tax estimate.'),
    });
  }

  exportReport(period: 'monthly' | 'quarterly', format: 'csv' | 'pdf' = 'csv'): void {
    this.finance.downloadReport(period, this.monthKey(), format).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `taxpal-${period}-report.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        this.message.set(`${format.toUpperCase()} report downloaded.`);
        this.loadReportHistory();
      },
      error: () => this.error.set(`Failed to export ${format.toUpperCase()} report.`),
    });
  }

  changeMonth(value: string): void {
    this.monthKey.set(value);
    this.loadDashboard();
    if (this.activeTab() === 'reports') {
      this.loadReport(this.reportPeriod());
    }
  }

  updateTransactionField<K extends keyof TransactionPayload>(field: K, value: TransactionPayload[K]): void {
    this.transactionForm.update((form) => ({ ...form, [field]: value }));
  }

  updateBudgetField(field: 'category' | 'limit', value: string): void {
    this.budgetForm.update((form) => ({
      ...form,
      [field]: field === 'limit' ? Math.max(0, Number(value) || 0) : value,
    }));
  }


  financialSnapshotChart(data: DashboardData): ChartConfiguration {
    const { totalIncome, totalExpenses, netIncome } = data.summary;
    return {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses', 'Net Income'],
        datasets: [
          {
            label: 'Amount (₹)',
            data: [totalIncome, totalExpenses, netIncome],
            backgroundColor: ['#10b981', '#ef4444', '#3b82f6'],
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: darkChartOptions({
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8' },
            grid: { display: false },
            border: { color: 'rgba(59, 130, 246, 0.15)' },
          },
          y: {
            ticks: {
              color: '#94a3b8',
              callback: (value) => this.formatAxisCurrency(Number(value)),
            },
            grid: { color: 'rgba(59, 130, 246, 0.08)' },
            border: { color: 'rgba(59, 130, 246, 0.15)' },
          },
        },
      }),
    };
  }

  spendingChart(data: DashboardData): ChartConfiguration {
    const categories = data.spendingByCategory;
    return {
      type: 'doughnut',
      data: {
        labels: categories.map((item) => this.titleCase(item.category)),
        datasets: [
          {
            data: categories.map((item) => item.total),
            backgroundColor: CHART_COLORS.slice(0, categories.length),
            borderWidth: 2,
            borderColor: '#0c1a35',
            hoverOffset: 6,
          },
        ],
      },
      options: doughnutChartOptions(),
    };
  }

  budgetChart(data: DashboardData): ChartConfiguration {
    const budgets = data.budgetProgress;
    return {
      type: 'bar',
      data: {
        labels: budgets.map((item) => this.titleCase(item.category)),
        datasets: [
          {
            label: 'Spent',
            data: budgets.map((item) => item.spent),
            backgroundColor: '#14b8a6',
            borderRadius: 6,
          },
          {
            label: 'Limit',
            data: budgets.map((item) => item.limit),
            backgroundColor: 'rgba(59, 130, 246, 0.35)',
            borderRadius: 6,
          },
        ],
      },
      options: darkChartOptions({
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', usePointStyle: true },
          },
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8' },
            grid: { display: false },
            border: { color: 'rgba(59, 130, 246, 0.15)' },
          },
          y: {
            ticks: {
              color: '#94a3b8',
              callback: (value) => this.formatAxisCurrency(Number(value)),
            },
            grid: { color: 'rgba(59, 130, 246, 0.08)' },
            border: { color: 'rgba(59, 130, 246, 0.15)' },
          },
        },
      }),
    };
  }

  reportChart(reportData: ReportSummary): ChartConfiguration {
    const entries = this.categoryEntries(reportData);
    return {
      type: 'bar',
      data: {
        labels: entries.map(([category]) => this.titleCase(category)),
        datasets: [
          {
            label: 'Income',
            data: entries.map(([, values]) => values.income),
            backgroundColor: '#10b981',
            borderRadius: 6,
          },
          {
            label: 'Expenses',
            data: entries.map(([, values]) => values.expense),
            backgroundColor: '#ef4444',
            borderRadius: 6,
          },
        ],
      },
      options: darkChartOptions({
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', usePointStyle: true },
          },
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8' },
            grid: { display: false },
            border: { color: 'rgba(59, 130, 246, 0.15)' },
          },
          y: {
            ticks: {
              color: '#94a3b8',
              callback: (value) => this.formatAxisCurrency(Number(value)),
            },
            grid: { color: 'rgba(59, 130, 246, 0.08)' },
            border: { color: 'rgba(59, 130, 246, 0.15)' },
          },
        },
      }),
    };
  }

  private formatAxisCurrency(value: number): string {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  }

  categoryEntries(reportData: ReportSummary): [string, { income: number; expense: number }][] {
    return Object.entries(reportData.byCategory || {});
  }

  currency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDueDate(value: string): string {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  titleCase(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private emptyTransaction(type: 'income' | 'expense'): TransactionPayload {
    const categories = type === 'income' ? this.incomeCategories() : this.expenseCategories();
    return {
      type,
      category: categories[0] || 'other',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    };
  }
}
