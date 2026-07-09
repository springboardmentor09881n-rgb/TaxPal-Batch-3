const express = require('express');
const fs = require('fs');
const path = require('path');
const Transaction = require('../models/Transaction');
const Report = require('../models/Report');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { calculateEstimatedTax, getFiscalYear } = require('../utils/taxCalculator');
const { buildReportPdf } = require('../utils/reportPdf');

const router = express.Router();
const EXPORTS_DIR = path.join(__dirname, '..', 'exports');

function ensureExportsDir() {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }
}

function parsePeriod(period = 'monthly', monthKey) {
  if (period === 'quarterly') {
    const fiscalYear = getFiscalYear();
    const start = new Date(fiscalYear, 3, 1);
    const end = new Date(fiscalYear + 1, 2, 31, 23, 59, 59, 999);
    return { label: `FY ${fiscalYear}-${String(fiscalYear + 1).slice(-2)}`, start, end, period };
  }

  const month = monthKey || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [year, monthNum] = month.split('-').map(Number);
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
  return { label: month, start, end, period };
}

async function buildReportData(userId, period, month) {
  const { label, start, end } = parsePeriod(period, month);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const byCategory = transactions.reduce((acc, tx) => {
    if (!acc[tx.category]) {
      acc[tx.category] = { income: 0, expense: 0 };
    }
    acc[tx.category][tx.type] += tx.amount;
    return acc;
  }, {});

  const user = await User.findById(userId);
  const taxableIncome = Math.max(0, income - expenses);
  const estimatedTax = calculateEstimatedTax(user?.country, taxableIncome);

  return {
    period: label,
    reportType: period,
    summary: {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      estimatedTax,
      transactionCount: transactions.length,
    },
    byCategory,
    transactions,
  };
}

async function persistReport(userId, reportData, format, fileName) {
  const filePath = path.join('exports', fileName);
  return Report.create({
    userId,
    period: reportData.period,
    report_type: reportData.reportType === 'quarterly' ? 'detailed' : 'summary',
    file_path: filePath,
    format,
    summary: reportData.summary,
  });
}

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const { period = 'monthly', month } = req.query;
    const reportData = await buildReportData(req.userId, period, month);
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load report history', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.file_path) {
      const absolutePath = path.join(__dirname, '..', report.file_path);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
});

router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { period = 'monthly', month, format = 'csv' } = req.query;
    const reportData = await buildReportData(req.userId, period, month);
    const { label, transactions, summary } = reportData;

    ensureExportsDir();

    if (format === 'csv') {
      const header = 'Date,Type,Category,Description,Amount';
      const rows = transactions.map((tx) => {
        const date = new Date(tx.date).toISOString().slice(0, 10);
        const description = `"${(tx.description || '').replace(/"/g, '""')}"`;
        return `${date},${tx.type},${tx.category},${description},${tx.amount}`;
      });

      const csvRows = [
        header,
        ...rows,
        '',
        'Summary',
        `Period,${label}`,
        `Total Income,${summary.totalIncome}`,
        `Total Expenses,${summary.totalExpenses}`,
        `Net Income,${summary.netIncome}`,
        `Estimated Tax,${summary.estimatedTax}`,
      ];

      const csv = csvRows.join('\n');
      const fileName = `taxpal-report-${label}-${Date.now()}.csv`;
      fs.writeFileSync(path.join(EXPORTS_DIR, fileName), csv);
      await persistReport(req.userId, reportData, 'csv', fileName);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(csv);
    }

    if (format === 'pdf') {
      const pdfBuffer = await buildReportPdf({
        label,
        period,
        summary,
        transactions: [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date)),
      });
      const fileName = `taxpal-report-${label}-${Date.now()}.pdf`;
      fs.writeFileSync(path.join(EXPORTS_DIR, fileName), pdfBuffer);
      await persistReport(req.userId, reportData, 'pdf', fileName);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(pdfBuffer);
    }

    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export report', error: error.message });
  }
});

module.exports = router;
