const express = require('express');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const month = req.query.month || currentMonthKey();
    const budgets = await Budget.find({ userId: req.userId, month }).sort({ category: 1 });

    const [year, monthNum] = month.split('-').map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const spending = await Transaction.aggregate([
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
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap = spending.reduce((acc, row) => {
      acc[row._id] = row.spent;
      return acc;
    }, {});

    const progress = budgets.map((budget) => {
      const spent = spentMap[budget.category] || 0;
      const percent = budget.limit > 0 ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0;
      return {
        id: budget._id,
        category: budget.category,
        limit: budget.limit,
        spent,
        remaining: Math.max(0, budget.limit - spent),
        percent,
        month: budget.month,
        status: spent > budget.limit ? 'over' : percent >= 80 ? 'warning' : 'ok',
      };
    });

    res.json({ month, budgets: progress });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load budgets', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    if (!category || limit === undefined) {
      return res.status(400).json({ message: 'Category and limit are required' });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.userId,
        category: category.trim(),
        month: month || currentMonthKey(),
      },
      { limit: Number(limit) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Budget saved', budget });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save budget', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete budget', error: error.message });
  }
});

module.exports = router;
