import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Report, ReportService } from '../../services/report';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  reports: Report[] = [];
  selectedReport: Report | null = null;
  reportForm: FormGroup;

  readonly reportTypes = [
    'Income Statement',
    'Expense Report',
    'Cash Flow Report',
    'Budget Report',
    'Tax Summary',
    'Transaction Summary'
  ];

  readonly periods = [
    'Current Month',
    'Quarter',
    'Annual',
    'Select Date'
  ];

  readonly formats = ['PDF', 'CSV', 'Excel'];

  isGenerating = false;
  isLoadingReports = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.reportForm = this.formBuilder.group({
      type: [this.reportTypes[0], Validators.required],
      period: [this.periods[0], Validators.required],
      format: ['PDF', Validators.required],
      customStartDate: [''],
      customEndDate: ['']
    });

    this.reportForm.get('period')?.valueChanges.subscribe(value => {
      if (value === 'Select Date' || value === 'Custom Period') {
        this.reportForm.get('customStartDate')?.setValidators([Validators.required]);
        this.reportForm.get('customEndDate')?.setValidators([Validators.required]);
      } else {
        this.reportForm.get('customStartDate')?.clearValidators();
        this.reportForm.get('customEndDate')?.clearValidators();
      }
      this.reportForm.get('customStartDate')?.updateValueAndValidity();
      this.reportForm.get('customEndDate')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoadingReports = true;
    this.reportService.getReports().subscribe({
      next: response => {
        this.reports = response.reports;
        this.isLoadingReports = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.isLoadingReports = false;
        this.errorMessage = 'Unable to load recent reports.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  generateReport(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    this.isGenerating = true;
    const formValue = this.reportForm.getRawValue();

    this.reportService.generateReport(formValue).subscribe({
      next: response => {
        this.isGenerating = false;
        this.successMessage = response.message;
        this.reports = [response.report, ...this.reports];
        this.selectedReport = response.report;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isGenerating = false;
        this.errorMessage = error.error?.message || 'Unable to generate report.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.reportForm.reset({
      type: this.reportTypes[0],
      period: this.periods[0],
      format: 'PDF',
      customStartDate: '',
      customEndDate: ''
    });
    this.errorMessage = '';
    this.successMessage = '';
  }

  selectReport(report: Report, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedReport = report;
    this.errorMessage = '';
    this.successMessage = '';
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      const previewEl = document.querySelector('.preview-card');
      if (previewEl) {
        previewEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }

  downloadSpecificReport(report: Report, event: Event): void {
    event.stopPropagation();
    this.selectedReport = report;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.downloadReport();
    }, 100);
  }

  deleteReport(report: Report, event: Event): void {
    event.stopPropagation();
    const confirmed = window.confirm(`Delete report ${report.name}?`);
    if (!confirmed) return;

    this.reportService.deleteReport(report._id).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r._id !== report._id);
        if (this.selectedReport?._id === report._id) {
          this.selectedReport = null;
        }
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Unable to delete report.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  printReport(): void {
    window.print();
  }

  downloadReport(): void {
    if (!this.selectedReport) return;
    
    const format = this.selectedReport.format;
    const fileName = `${this.selectedReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'CSV') {
      this.downloadCSV(this.selectedReport, fileName);
    } else if (format === 'Excel') {
      this.downloadExcel(this.selectedReport, fileName);
    } else {
      // For PDF fallback to printing
      this.printReport();
    }
  }

  private downloadCSV(report: Report, fileName: string): void {
    const data = report.data;
    let csv = `Report Name,${report.name}\n`;
    csv += `Period,${report.period}\n`;
    csv += `Generated,${new Date(report.createdAt).toLocaleString()}\n\n`;

    // Summary Metrics
    csv += `SUMMARY METRICS\n`;
    if (data.totalTransactions !== undefined) csv += `Total Transactions,${data.totalTransactions}\n`;
    if (data.totalIncome !== undefined) csv += `Total Income,₹${data.totalIncome.toFixed(2)}\n`;
    if (data.totalExpense !== undefined && report.type !== 'Income Statement') csv += `Total Expense,₹${data.totalExpense.toFixed(2)}\n`;
    if (data.netAmount !== undefined) csv += `Net Balance,₹${data.netAmount.toFixed(2)}\n`;
    if (data.netIncome !== undefined && report.type !== 'Income Statement') csv += `Net Income,₹${data.netIncome.toFixed(2)}\n`;
    if (data.cashInflow !== undefined) csv += `Cash Inflow,₹${data.cashInflow.toFixed(2)}\n`;
    if (data.cashOutflow !== undefined) csv += `Cash Outflow,₹${data.cashOutflow.toFixed(2)}\n`;
    if (data.netCashFlow !== undefined) csv += `Net Cash Flow,₹${data.netCashFlow.toFixed(2)}\n`;
    if (data.totalBudget !== undefined) {
      csv += `Total Budget,₹${data.totalBudget.toFixed(2)}\n`;
      csv += `Actual Spending,₹${data.totalActual.toFixed(2)}\n`;
      csv += `Remaining Amount,₹${data.remainingAmount.toFixed(2)}\n`;
      csv += `Utilization,${data.utilization.toFixed(2)}%\n`;
    }

    // Breakdown Sections
    if (report.type !== 'Expense Report' && data.incomeByCategory && Object.keys(data.incomeByCategory).length > 0) {
      csv += `\nINCOME BREAKDOWN\nCategory,Amount\n`;
      Object.keys(data.incomeByCategory).forEach(cat => {
        csv += `"${cat}",₹${Number(data.incomeByCategory[cat]).toFixed(2)}\n`;
      });
    }

    if (report.type !== 'Income Statement' && data.expenseByCategory && Object.keys(data.expenseByCategory).length > 0) {
      csv += `\nEXPENSE BREAKDOWN\nCategory,Amount\n`;
      Object.keys(data.expenseByCategory).forEach(cat => {
        csv += `"${cat}",₹${Number(data.expenseByCategory[cat]).toFixed(2)}\n`;
      });
    }

    if (data.categories && Object.keys(data.categories).length > 0) {
      csv += `\nCATEGORY BUDGETS\nCategory,Budget,Spent,Remaining,Utilization\n`;
      Object.keys(data.categories).forEach(cat => {
        const item = data.categories[cat];
        csv += `"${cat}",₹${Number(item.budgetAmount).toFixed(2)},₹${Number(item.actualSpending).toFixed(2)},₹${Number(item.remaining).toFixed(2)},${Number(item.utilization).toFixed(1)}%\n`;
      });
    }

    if (data.taxEstimates && data.taxEstimates.length > 0) {
      csv += `\nTAX ESTIMATES\nCountry,Tax Year,Taxable Income,Estimated Annual Tax,Estimated Quarterly Tax\n`;
      data.taxEstimates.forEach((tax: any) => {
        csv += `"${tax.country}",${tax.taxYear},₹${Number(tax.taxableIncome).toFixed(2)},₹${Number(tax.estimatedAnnualTax).toFixed(2)},₹${Number(tax.estimatedQuarterlyTax).toFixed(2)}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private downloadExcel(report: Report, fileName: string): void {
    const data = report.data;

    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${report.name.substring(0, 31)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          body { font-family: Calibri, Arial, sans-serif; }
          .title-cell { background-color: #2563eb; color: #ffffff; font-size: 16pt; font-weight: bold; text-align: center; height: 40px; }
          .meta-cell { background-color: #f8fafc; color: #475467; font-size: 10pt; font-style: italic; }
          .header-cell { background-color: #3b82f6; color: #ffffff; font-size: 11pt; font-weight: bold; text-align: left; padding: 6px; }
          .section-title { font-size: 12pt; font-weight: bold; color: #1e293b; background-color: #e2e8f0; height: 30px; }
          .kpi-label { font-weight: bold; background-color: #f1f5f9; color: #334155; }
          .kpi-value { font-weight: bold; color: #0f172a; text-align: right; }
          .table-cell { padding: 6px; border: 1px solid #e2e8f0; }
          .num-cell { text-align: right; padding: 6px; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse; width: 100%;">
          <tr>
            <th colspan="4" class="title-cell">${report.name}</th>
          </tr>
          <tr>
            <td colspan="4" class="meta-cell">Period: ${report.period} | Generated: ${new Date(report.createdAt).toLocaleString()}</td>
          </tr>
          <tr><td colspan="4" style="height:15px; border:none;"></td></tr>

          <!-- Summary Metrics -->
          <tr>
            <th colspan="4" class="section-title">SUMMARY METRICS</th>
          </tr>`;

    if (data.totalTransactions !== undefined) {
      excelContent += `<tr><td colspan="2" class="kpi-label">Total Transactions</td><td colspan="2" class="kpi-value">${data.totalTransactions}</td></tr>`;
    }
    if (data.totalIncome !== undefined) {
      excelContent += `<tr><td colspan="2" class="kpi-label">Total Income</td><td colspan="2" class="kpi-value">₹${data.totalIncome.toFixed(2)}</td></tr>`;
    }
    if (data.totalExpense !== undefined && report.type !== 'Income Statement') {
      excelContent += `<tr><td colspan="2" class="kpi-label">Total Expense</td><td colspan="2" class="kpi-value">₹${data.totalExpense.toFixed(2)}</td></tr>`;
    }
    if (data.netAmount !== undefined) {
      excelContent += `<tr><td colspan="2" class="kpi-label">Net Balance</td><td colspan="2" class="kpi-value">₹${data.netAmount.toFixed(2)}</td></tr>`;
    }
    if (data.netCashFlow !== undefined) {
      excelContent += `<tr><td colspan="2" class="kpi-label">Net Cash Flow</td><td colspan="2" class="kpi-value">₹${data.netCashFlow.toFixed(2)}</td></tr>`;
    }
    if (data.cashInflow !== undefined) {
      excelContent += `<tr><td colspan="2" class="kpi-label">Cash Inflow</td><td colspan="2" class="kpi-value">₹${data.cashInflow.toFixed(2)}</td></tr>`;
    }
    if (data.cashOutflow !== undefined) {
      excelContent += `<tr><td colspan="2" class="kpi-label">Cash Outflow</td><td colspan="2" class="kpi-value">₹${data.cashOutflow.toFixed(2)}</td></tr>`;
    }
    if (data.totalBudget !== undefined) {
      excelContent += `<tr><td colspan="2" class="kpi-label">Total Budget</td><td colspan="2" class="kpi-value">₹${data.totalBudget.toFixed(2)}</td></tr>`;
      excelContent += `<tr><td colspan="2" class="kpi-label">Actual Spending</td><td colspan="2" class="kpi-value">₹${data.totalActual.toFixed(2)}</td></tr>`;
      excelContent += `<tr><td colspan="2" class="kpi-label">Remaining Amount</td><td colspan="2" class="kpi-value">₹${data.remainingAmount.toFixed(2)}</td></tr>`;
      excelContent += `<tr><td colspan="2" class="kpi-label">Utilization</td><td colspan="2" class="kpi-value">${data.utilization.toFixed(2)}%</td></tr>`;
    }

    excelContent += `<tr><td colspan="4" style="height:15px; border:none;"></td></tr>`;

    // Income Breakdown
    if (report.type !== 'Expense Report' && data.incomeByCategory && Object.keys(data.incomeByCategory).length > 0) {
      excelContent += `
        <tr><th colspan="4" class="section-title">INCOME BREAKDOWN</th></tr>
        <tr>
          <th colspan="2" class="header-cell">Category</th>
          <th colspan="2" class="header-cell" style="text-align:right;">Amount (₹)</th>
        </tr>`;
      Object.keys(data.incomeByCategory).forEach(cat => {
        excelContent += `
          <tr>
            <td colspan="2" class="table-cell">${cat}</td>
            <td colspan="2" class="num-cell">₹${Number(data.incomeByCategory[cat]).toFixed(2)}</td>
          </tr>`;
      });
      excelContent += `<tr><td colspan="4" style="height:15px; border:none;"></td></tr>`;
    }

    // Expense Breakdown
    if (report.type !== 'Income Statement' && data.expenseByCategory && Object.keys(data.expenseByCategory).length > 0) {
      excelContent += `
        <tr><th colspan="4" class="section-title">EXPENSE BREAKDOWN</th></tr>
        <tr>
          <th colspan="2" class="header-cell">Category</th>
          <th colspan="2" class="header-cell" style="text-align:right;">Amount (₹)</th>
        </tr>`;
      Object.keys(data.expenseByCategory).forEach(cat => {
        excelContent += `
          <tr>
            <td colspan="2" class="table-cell">${cat}</td>
            <td colspan="2" class="num-cell">₹${Number(data.expenseByCategory[cat]).toFixed(2)}</td>
          </tr>`;
      });
      excelContent += `<tr><td colspan="4" style="height:15px; border:none;"></td></tr>`;
    }

    // Category Budgets
    if (data.categories && Object.keys(data.categories).length > 0) {
      excelContent += `
        <tr><th colspan="4" class="section-title">CATEGORY BUDGETS</th></tr>
        <tr>
          <th class="header-cell">Category</th>
          <th class="header-cell" style="text-align:right;">Budget</th>
          <th class="header-cell" style="text-align:right;">Spent</th>
          <th class="header-cell" style="text-align:right;">Utilization</th>
        </tr>`;
      Object.keys(data.categories).forEach(cat => {
        const item = data.categories[cat];
        excelContent += `
          <tr>
            <td class="table-cell">${cat}</td>
            <td class="num-cell">₹${Number(item.budgetAmount).toFixed(2)}</td>
            <td class="num-cell">₹${Number(item.actualSpending).toFixed(2)}</td>
            <td class="num-cell">${Number(item.utilization).toFixed(1)}%</td>
          </tr>`;
      });
      excelContent += `<tr><td colspan="4" style="height:15px; border:none;"></td></tr>`;
    }

    // Tax Estimates
    if (data.taxEstimates && data.taxEstimates.length > 0) {
      excelContent += `
        <tr><th colspan="4" class="section-title">TAX ESTIMATES</th></tr>
        <tr>
          <th class="header-cell">Country (Tax Year)</th>
          <th class="header-cell" style="text-align:right;">Taxable Income</th>
          <th class="header-cell" style="text-align:right;">Annual Tax</th>
          <th class="header-cell" style="text-align:right;">Quarterly Tax</th>
        </tr>`;
      data.taxEstimates.forEach((tax: any) => {
        excelContent += `
          <tr>
            <td class="table-cell">${tax.country} (${tax.taxYear})</td>
            <td class="num-cell">₹${Number(tax.taxableIncome).toFixed(2)}</td>
            <td class="num-cell">₹${Number(tax.estimatedAnnualTax).toFixed(2)}</td>
            <td class="num-cell">₹${Number(tax.estimatedQuarterlyTax).toFixed(2)}</td>
          </tr>`;
      });
    }

    excelContent += `
        </table>
      </body>
      </html>`;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  trackReport(index: number, report: Report): string {
    return report._id;
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
