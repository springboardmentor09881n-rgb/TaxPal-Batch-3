const express = require('express');

const {
  calculateTax,
  saveTaxEstimate,
  getTaxEstimates,
  deleteTaxEstimate
} = require('../controllers/taxController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/calculate', calculateTax);

router.post('/estimates', saveTaxEstimate);

router.get('/estimates', getTaxEstimates);

router.delete('/estimates/:id', deleteTaxEstimate);

module.exports = router;