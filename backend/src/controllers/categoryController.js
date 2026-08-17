const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  // Income defaults
  { name: 'Salary', type: 'income', description: 'Default', isDefault: true },
  { name: 'Freelance', type: 'income', description: 'Default', isDefault: true },
  { name: 'Investments', type: 'income', description: 'Default', isDefault: true },
  { name: 'Business Income', type: 'income', description: 'Default', isDefault: true },
  { name: 'Business', type: 'income', description: 'Default', isDefault: true },
  { name: 'Refunds & Reimbursements', type: 'income', description: 'Default', isDefault: true },
  { name: 'Rental Income', type: 'income', description: 'Default', isDefault: true },
  { name: 'Other Income', type: 'income', description: 'Default', isDefault: true },

  // Expense defaults
  { name: 'Rent / Housing', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Food & Dining', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Utilities', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Transportation', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Entertainment', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Healthcare', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Shopping', type: 'expense', description: 'Default', isDefault: true },
  { name: 'Other Expense', type: 'expense', description: 'Default', isDefault: true }
];

const DEFAULT_NAMES_SET = new Set(
  DEFAULT_CATEGORIES.map(d => `${d.type}:${d.name.toLowerCase()}`)
);

const isDefaultCategory = (name, type) => {
  return DEFAULT_NAMES_SET.has(`${type}:${(name || '').toLowerCase()}`);
};

const addCategory = async (req, res) => {
  try {
    const {
      name,
      type,
      description
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: 'Category name and type are required'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        message: 'Category type must be income or expense'
      });
    }

    const normalizedName = name.trim();

    if (!normalizedName) {
      return res.status(400).json({
        message: 'Category name is required'
      });
    }

    const existingCategory = await Category.findOne({
      user: req.userId,
      name: normalizedName,
      type
    });

    if (existingCategory) {
      return res.status(400).json({
        message: 'Category already exists'
      });
    }

    const isDef = isDefaultCategory(normalizedName, type) || description?.trim().toLowerCase() === 'default';

    const category = await Category.create({
      user: req.userId,
      name: normalizedName,
      type,
      description: isDef ? 'Default' : (description || 'User Custom Category'),
      isDefault: isDef
    });

    return res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error(
      'Add category error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error while creating category'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    let categories = await Category.find({ user: req.userId })
      .sort({
        type: 1,
        isDefault: -1,
        name: 1
      })
      .lean();

    if (categories.length === 0) {
      const initialDefaults = DEFAULT_CATEGORIES.map(d => ({
        ...d,
        user: req.userId
      }));
      try {
        await Category.insertMany(initialDefaults, { ordered: false });
      } catch (err) {
        // Ignore duplicate key errors if any race condition occurred
      }
      categories = await Category.find({ user: req.userId })
        .sort({
          type: 1,
          isDefault: -1,
          name: 1
        })
        .lean();
    }

    const mappedCategories = categories.map(cat => {
      const isDef = cat.isDefault || cat.description?.toLowerCase() === 'default' || isDefaultCategory(cat.name, cat.type);
      return {
        ...cat,
        isDefault: isDef,
        description: isDef ? 'Default' : (cat.description || 'User Custom Category')
      };
    });

    return res.status(200).json({
      count: mappedCategories.length,
      categories: mappedCategories
    });
  } catch (error) {
    console.error(
      'Get categories error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error while fetching categories'
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const {
      name,
      type,
      description
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: 'Category name and type are required'
      });
    }

    const existing = await Category.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!existing) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    if (existing.isDefault || isDefaultCategory(existing.name, existing.type)) {
      return res.status(403).json({
        message: 'Default categories cannot be edited'
      });
    }

    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      {
        name: name.trim(),
        type,
        description: description || ''
      },
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    console.error(
      'Update category error:',
      error.message
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid category ID'
      });
    }

    return res.status(500).json({
      message: 'Server error while updating category'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const existing = await Category.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!existing) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    if (existing.isDefault || isDefaultCategory(existing.name, existing.type)) {
      return res.status(403).json({
        message: 'Default categories cannot be deleted'
      });
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    return res.status(200).json({
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error(
      'Delete category error:',
      error.message
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid category ID'
      });
    }

    return res.status(500).json({
      message: 'Server error while deleting category'
    });
  }
};

module.exports = {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
};