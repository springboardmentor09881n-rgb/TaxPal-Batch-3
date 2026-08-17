const express = require('express');

const protect = require('../middleware/authMiddleware');

const {
  createTransaction,
  getTransactions,
  deleteTransaction
} = require('../controllers/transactionController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTransactions)
  .post(createTransaction);

router.delete('/:id', deleteTransaction);

module.exports = router;