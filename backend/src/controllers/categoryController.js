const Category = require('../models/Category');

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

    const category = await Category.create({
      user: req.userId,
      name: normalizedName,
      type,
      description: description || ''
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

    const query = {
      user: req.userId
    };

    if (req.query.type) {
      query.type = req.query.type;
    }

    const categories = await Category.find(query).sort({
      type: 1,
      name: 1
    });

    return res.status(200).json({
      count: categories.length,
      categories
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

    if (!category) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

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

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!category) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

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