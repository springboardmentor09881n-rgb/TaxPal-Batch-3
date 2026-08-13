const Report = require('../models/Report');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const TaxEstimate = require('../models/TaxEstimate');

const getPeriodDates = (period, customStartDate, customEndDate) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (period) {
    case 'Current Month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'Previous Month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'Current Quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      endDate = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0, 23, 59, 59);
      break;
    case 'Previous Quarter':
      const prevQuarter = Math.floor(now.getMonth() / 3) - 1;
      startDate = new Date(now.getFullYear(), prevQuarter * 3, 1);
      endDate = new Date(now.getFullYear(), prevQuarter * 3 + 3, 0, 23, 59, 59);
      break;
    case 'Current Year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'Previous Year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      break;
    case 'Custom Period':
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59);
      }
      break;
    default:
      startDate = new Date(0);
      endDate = new Date();
  }
  return { startDate, endDate };
};

const generateReport = async (req, res) => {
  try {
    const { type, period, format, customStartDate, customEndDate } = req.body;

    if (!type || !period || !format) {
      return res.status(400).json({ message: 'Missing required report parameters' });
    }

    const { startDate, endDate } = getPeriodDates(period, customStartDate, customEndDate);
    const dateFilter = { $gte: startDate, $lte: endDate };

    let data = {};

    if (type === 'Income Statement' || type === 'Expense Report' || type === 'Cash Flow Report' || type === 'Transaction Summary') {
      const transactions = await Transaction.find({ user: req.userId, date: dateFilter });
      
      let totalIncome = 0;
      let totalExpense = 0;
      let incomeByCategory = {};
      let expenseByCategory = {};

      transactions.forEach(t => {
        if (t.type === 'income') {
          totalIncome += t.amount;
          incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else if (t.type === 'expense') {
          totalExpense += t.amount;
          expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        }
      });

      if (type === 'Income Statement') {
        data = { totalIncome, totalExpense, netIncome: totalIncome - totalExpense, incomeByCategory, expenseByCategory, startDate, endDate };
      } else if (type === 'Expense Report') {
        data = { totalExpense, expenseByCategory, startDate, endDate };
      } else if (type === 'Cash Flow Report') {
        data = { cashInflow: totalIncome, cashOutflow: totalExpense, netCashFlow: totalIncome - totalExpense, startDate, endDate };
      } else if (type === 'Transaction Summary') {
        data = { totalTransactions: transactions.length, totalIncome, totalExpense, netAmount: totalIncome - totalExpense, expenseByCategory, incomeByCategory, startDate, endDate };
      }
    } else if (type === 'Budget Report') {
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;
      const endYear = endDate.getFullYear();

      const budgets = await Budget.find({
        user: req.userId,
        year: { $gte: startYear, $lte: endYear }
      });
      
      // Filter out budgets strictly outside month range if same year
      const filteredBudgets = budgets.filter(b => {
        const d = new Date(b.year, b.month - 1, 15);
        return d >= startDate && d <= endDate;
      });

      const transactions = await Transaction.find({ user: req.userId, type: 'expense', date: dateFilter });
      
      let budgetSummary = {};
      filteredBudgets.forEach(b => {
        budgetSummary[b.category] = { budgetAmount: (budgetSummary[b.category]?.budgetAmount || 0) + b.monthlyLimit, actualSpending: 0 };
      });
      
      transactions.forEach(t => {
        if (!budgetSummary[t.category]) {
          budgetSummary[t.category] = { budgetAmount: 0, actualSpending: 0 };
        }
        budgetSummary[t.category].actualSpending += t.amount;
      });
      
      let totalBudget = 0;
      let totalActual = 0;
      Object.keys(budgetSummary).forEach(cat => {
        totalBudget += budgetSummary[cat].budgetAmount;
        totalActual += budgetSummary[cat].actualSpending;
        budgetSummary[cat].remaining = budgetSummary[cat].budgetAmount - budgetSummary[cat].actualSpending;
        budgetSummary[cat].utilization = budgetSummary[cat].budgetAmount > 0 ? (budgetSummary[cat].actualSpending / budgetSummary[cat].budgetAmount) * 100 : 0;
      });

      data = { totalBudget, totalActual, remainingAmount: totalBudget - totalActual, utilization: totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0, categories: budgetSummary, startDate, endDate };
    } else if (type === 'Tax Summary') {
      const taxes = await TaxEstimate.find({ user: req.userId, createdAt: dateFilter }).sort({ createdAt: -1 });
      data = { taxEstimates: taxes, count: taxes.length, startDate, endDate };
    }

    const reportName = `${type} - ${period}`;
    const report = await Report.create({
      user: req.userId,
      name: reportName,
      type,
      period,
      format,
      data
    });

    res.status(201).json({ message: 'Report generated successfully', report });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ count: reports.length, reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error while deleting report' });
  }
};

module.exports = {
  generateReport,
  getReports,
  deleteReport
};
