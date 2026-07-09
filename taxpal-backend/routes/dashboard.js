const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const TaxEstimate = require('../models/TaxEstimate');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const {
  calculateEstimatedTax,
  getFiscalYear,
  getQuarter,
  buildTaxCalendar,
} = require('../utils/taxCalculator');
const { syncUserAlerts, getUserAlerts, getUnreadCount } = require('../utils/alertService');

const router = express.Router();

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const month = req.query.month || currentMonthKey();
    const [year, monthNum] = month.split('-').map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const user = await User.findById(req.userId).select('-password');
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(50);

    const monthTotals = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalIncome = monthTotals.find((row) => row._id === 'income')?.total || 0;
    const totalExpenses = monthTotals.find((row) => row._id === 'expense')?.total || 0;

    const spendingByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const budgets = await Budget.find({ userId: req.userId, month });
    const spentMap = spendingByCategory.reduce((acc, row) => {
      acc[row._id] = row.total;
      return acc;
    }, {});

    const budgetProgress = budgets.map((budget) => {
      const spent = spentMap[budget.category] || 0;
      const percent = budget.limit > 0 ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0;
      return {
        id: budget._id,
        category: budget.category,
        limit: budget.limit,
        spent,
        percent,
        status: spent > budget.limit ? 'over' : percent >= 80 ? 'warning' : 'ok',
      };
    });

    const fiscalYear = getFiscalYear();
    const fyStart = new Date(fiscalYear, 3, 1);
    const fyEnd = new Date(fiscalYear + 1, 2, 31, 23, 59, 59, 999);

    const fyTotals = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: fyStart, $lte: fyEnd },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const fyIncome = fyTotals.find((row) => row._id === 'income')?.total || 0;
    const fyExpenses = fyTotals.find((row) => row._id === 'expense')?.total || 0;
    const taxableIncome = Math.max(0, fyIncome - fyExpenses);
    const annualTax = calculateEstimatedTax(user?.country, taxableIncome);
    const quarterlyTax = Math.round(annualTax / 4);

    const savedEstimates = await TaxEstimate.find({ userId: req.userId, fiscalYear }).sort({ quarter: 1 });
    const taxCalendar = buildTaxCalendar(fiscalYear);

    await syncUserAlerts(req.userId, { calendar: taxCalendar, budgetProgress });
    const alerts = await getUserAlerts(req.userId);
    const unreadAlertCount = await getUnreadCount(req.userId);

    res.json({
      user,
      month,
      summary: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        budgetRemaining: budgets.reduce((sum, b) => sum + b.limit, 0) - totalExpenses,
      },
      transactions,
      spendingByCategory: spendingByCategory.map((row) => ({
        category: row._id,
        total: row.total,
      })),
      budgetProgress,
      alerts,
      unreadAlertCount,
      tax: {
        quarter: getQuarter(),
        fiscalYear,
        taxableIncome,
        annualTax,
        quarterlyTax,
        calendar: taxCalendar,
        savedEstimates,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dashboard', error: error.message });
  }
});

module.exports = router;
