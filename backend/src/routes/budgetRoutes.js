const express = require('express');

const {
  setBudget,
  getBudgets,
  deleteBudget
} = require('../controllers/budgetController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getBudgets);

router.post('/', setBudget);

router.delete('/:id', deleteBudget);

module.exports = router;