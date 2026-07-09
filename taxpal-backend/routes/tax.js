const express = require('express');
const Transaction = require('../models/Transaction');
const TaxEstimate = require('../models/TaxEstimate');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const {
  buildTaxCalendar,
  calculateEstimatedTax,
  getFiscalYear,
  getQuarter,
} = require('../utils/taxCalculator');

const router = express.Router();

async function getAnnualTaxableIncome(userId) {
  const now = new Date();
  const fiscalYear = getFiscalYear(now);
  const start = new Date(fiscalYear, 3, 1);
  const end = new Date(fiscalYear + 1, 2, 31, 23, 59, 59, 999);

  const totals = await Transaction.aggregate([
    {
      $match: {
        userId,
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

  const income = totals.find((row) => row._id === 'income')?.total || 0;
  const expenses = totals.find((row) => row._id === 'expense')?.total || 0;
  return Math.max(0, income - expenses);
}

router.get('/calendar', authMiddleware, (_req, res) => {
  const year = getFiscalYear();
  res.json({ calendar: buildTaxCalendar(year), fiscalYear: year });
});

router.get('/estimate', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const taxableIncome = await getAnnualTaxableIncome(req.userId);
    const annualTax = calculateEstimatedTax(user.country, taxableIncome);
    const quarterlyTax = Math.round(annualTax / 4);
    const quarter = getQuarter();
    const fiscalYear = getFiscalYear();

    res.json({
      country: user.country,
      incomeBracket: user.income_bracket,
      taxableIncome,
      annualTax,
      quarterlyTax,
      quarter,
      fiscalYear,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate tax estimate', error: error.message });
  }
});

router.get('/estimates', authMiddleware, async (req, res) => {
  try {
    const estimates = await TaxEstimate.find({ userId: req.userId }).sort({ fiscalYear: -1, quarter: 1 });
    res.json({ estimates });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load tax estimates', error: error.message });
  }
});

router.post('/estimates', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const taxableIncome = await getAnnualTaxableIncome(req.userId);
    const annualTax = calculateEstimatedTax(user.country, taxableIncome);
    const quarterlyTax = Math.round(annualTax / 4);
    const quarter = req.body.quarter || getQuarter();
    const fiscalYear = req.body.fiscalYear || getFiscalYear();

    const estimate = await TaxEstimate.findOneAndUpdate(
      { userId: req.userId, quarter, fiscalYear },
      {
        estimatedTax: quarterlyTax,
        taxableIncome,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Tax estimate saved', estimate, annualTax, quarterlyTax });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save tax estimate', error: error.message });
  }
});

router.delete('/estimates/:id', authMiddleware, async (req, res) => {
  try {
    const estimate = await TaxEstimate.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!estimate) {
      return res.status(404).json({ message: 'Tax estimate not found' });
    }
    res.json({ message: 'Tax estimate deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete tax estimate', error: error.message });
  }
});

module.exports = router;
