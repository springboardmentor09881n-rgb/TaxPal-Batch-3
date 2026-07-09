export interface TransactionPayload {
  type: 'income' | 'expense';
  category: string;
  description?: string;
  amount: number;
  date: string;
}

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface BudgetProgress {
  id?: string;
  category: string;
  limit: number;
  spent: number;
  remaining?: number;
  percent: number;
  status: 'ok' | 'warning' | 'over';
  month?: string;
}

export interface CategorySpending {
  category: string;
  total: number;
}

export interface TaxCalendarItem {
  quarter: string;
  dueDate: string;
  label: string;
  status: 'past' | 'upcoming';
}

export interface TaxEstimateRecord {
  _id: string;
  quarter: string;
  fiscalYear: number;
  estimatedTax: number;
  taxableIncome: number;
}

export interface DashboardTax {
  quarter: string;
  fiscalYear: number;
  taxableIncome: number;
  annualTax: number;
  quarterlyTax: number;
  calendar: TaxCalendarItem[];
  savedEstimates: TaxEstimateRecord[];
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  budgetRemaining: number;
}

export interface DashboardData {
  month: string;
  summary: DashboardSummary;
  transactions: Transaction[];
  spendingByCategory: CategorySpending[];
  budgetProgress: BudgetProgress[];
  tax: DashboardTax;
  alerts?: Alert[];
  unreadAlertCount?: number;
}

export interface Alert {
  _id: string;
  type: 'tax' | 'budget' | 'system';
  message: string;
  alertDate: string;
  isRead: boolean;
}

export interface SuggestedCategory {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  description: string;
}

export interface SavedReport {
  _id: string;
  period: string;
  report_type: string;
  file_path: string;
  format: 'csv' | 'pdf' | 'json';
  summary: ReportSummary['summary'];
  createdAt: string;
}

export interface TaxCalculation {
  country: string;
  incomeBracket: string;
  taxableIncome: number;
  annualTax: number;
  quarterlyTax: number;
  quarter: string;
  fiscalYear: number;
}

export interface ReportSummary {
  period: string;
  reportType: string;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    estimatedTax: number;
    transactionCount: number;
  };
  byCategory: Record<string, { income: number; expense: number }>;
  transactions: Transaction[];
}
