const express = require('express');

const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', addCategory);
router.get('/', getCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;