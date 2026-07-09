const express = require('express');
const SuggestedCategory = require('../models/SuggestedCategory');
const authMiddleware = require('../middleware/auth');
const { getCategoryLists } = require('../utils/seedCategories');

const router = express.Router();

router.get('/', authMiddleware, async (_req, res) => {
  try {
    const lists = await getCategoryLists();
    res.json({
      income: lists.income,
      expense: lists.expense,
      categories: lists.all,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, type, description = '' } = req.body;

    if (!name || !type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Name and valid type (income/expense) are required' });
    }

    const category = await SuggestedCategory.create({
      name: name.trim().toLowerCase(),
      type,
      description: description.trim(),
    });

    res.status(201).json({ message: 'Category added', category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category already exists for this type' });
    }
    res.status(500).json({ message: 'Failed to add category', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await SuggestedCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name.trim().toLowerCase();
    if (description !== undefined) category.description = description.trim();

    await category.save();
    res.json({ message: 'Category updated', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await SuggestedCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

module.exports = router;
