const mongoose = require('mongoose');

const taxEstimateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4'],
      required: true,
    },
    fiscalYear: {
      type: Number,
      required: true,
    },
    estimatedTax: {
      type: Number,
      required: true,
      min: 0,
    },
    taxableIncome: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

taxEstimateSchema.index({ userId: 1, quarter: 1, fiscalYear: 1 }, { unique: true });

module.exports = mongoose.model('TaxEstimate', taxEstimateSchema);
