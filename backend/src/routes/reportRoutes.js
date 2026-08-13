const express = require('express');
const {
  generateReport,
  getReports,
  deleteReport
} = require('../controllers/reportController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate', generateReport);
router.get('/', getReports);
router.delete('/:id', deleteReport);

module.exports = router;
