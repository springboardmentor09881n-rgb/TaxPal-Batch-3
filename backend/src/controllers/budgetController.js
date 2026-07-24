const Budget = require('../models/Budget');

const setBudget = async (req, res) => {
  try {
    const {
      category,
      monthlyLimit,
      month,
      year
    } = req.body;

    if (
      !category ||
      monthlyLimit === undefined ||
      month === undefined ||
      year === undefined
    ) {
      return res.status(400).json({
        message:
          'Category, monthly limit, month, and year are required'
      });
    }

    const numericLimit = Number(monthlyLimit);
    const numericMonth = Number(month);
    const numericYear = Number(year);

    if (
      !Number.isFinite(numericLimit) ||
      numericLimit <= 0
    ) {
      return res.status(400).json({
        message: 'Monthly limit must be greater than 0'
      });
    }

    if (
      !Number.isInteger(numericMonth) ||
      numericMonth < 1 ||
      numericMonth > 12
    ) {
      return res.status(400).json({
        message: 'Month must be between 1 and 12'
      });
    }

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 2000
    ) {
      return res.status(400).json({
        message: 'Enter a valid year'
      });
    }

    const normalizedCategory = category.trim();

    if (!normalizedCategory) {
      return res.status(400).json({
        message: 'Category is required'
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.userId,
        category: normalizedCategory,
        month: numericMonth,
        year: numericYear
      },
      {
        $set: {
          monthlyLimit: numericLimit
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      message: 'Budget saved successfully',
      budget
    });
  } catch (error) {
    console.error(
      'Set budget error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error while saving budget'
    });
  }
};

const getBudgets = async (req, res) => {
  try {
    const query = {
      user: req.userId
    };

    if (req.query.month !== undefined) {
      const month = Number(req.query.month);

      if (
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
      ) {
        return res.status(400).json({
          message: 'Month must be between 1 and 12'
        });
      }

      query.month = month;
    }

    if (req.query.year !== undefined) {
      const year = Number(req.query.year);

      if (
        !Number.isInteger(year) ||
        year < 2000
      ) {
        return res.status(400).json({
          message: 'Enter a valid year'
        });
      }

      query.year = year;
    }

    const budgets = await Budget.find(query).sort({
      year: -1,
      month: -1,
      category: 1
    });

    return res.status(200).json({
      count: budgets.length,
      budgets
    });
  } catch (error) {
    console.error(
      'Get budgets error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error while fetching budgets'
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    return res.status(200).json({
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error(
      'Delete budget error:',
      error.message
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid budget ID'
      });
    }

    return res.status(500).json({
      message: 'Server error while deleting budget'
    });
  }
};

module.exports = {
  setBudget,
  getBudgets,
  deleteBudget
};