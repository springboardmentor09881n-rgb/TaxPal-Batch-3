const express = require('express');
const Transaction = require('../models/Transaction');
const { suggestCategory } = require('../utils/categories');
const { getCategoryLists } = require('../utils/seedCategories');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/categories', authMiddleware, async (_req, res) => {
  try {
    const lists = await getCategoryLists();
    res.json({ income: lists.income, expense: lists.expense });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories', error: error.message });
  }
});

router.post('/suggest-category', authMiddleware, async (req, res) => {
  try {
    const { description = '', type = 'expense' } = req.body;
    const lists = await getCategoryLists();
    const pool = type === 'income' ? lists.income : lists.expense;
    res.json({ category: suggestCategory(description, type, pool) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to suggest category', error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = { userId: req.userId };

    if (req.query.type === 'income' || req.query.type === 'expense') {
      filter.type = req.query.type;
    }

    if (req.query.month && /^\d{4}-\d{2}$/.test(req.query.month)) {
      const [year, month] = req.query.month.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load transactions', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, category, description, amount, date } = req.body;

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Transaction type must be income or expense' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const lists = await getCategoryLists();
    const pool = type === 'income' ? lists.income : lists.expense;

    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      category: category || suggestCategory(description, type, pool),
      description: description || '',
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({ message: 'Transaction added', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add transaction', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { type, category, description, amount, date } = req.body;

    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (date) transaction.date = new Date(date);

    await transaction.save();
    res.json({ message: 'Transaction updated', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction', error: error.message });
  }
});

module.exports = router;
