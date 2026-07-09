const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: { type: String, required: true, trim: true },
    report_type: {
      type: String,
      enum: ['summary', 'detailed', 'tax'],
      default: 'summary',
    },
    file_path: { type: String, default: '' },
    format: {
      type: String,
      enum: ['csv', 'pdf', 'json'],
      default: 'csv',
    },
    summary: {
      totalIncome: { type: Number, default: 0 },
      totalExpenses: { type: Number, default: 0 },
      netIncome: { type: Number, default: 0 },
      estimatedTax: { type: Number, default: 0 },
      transactionCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
