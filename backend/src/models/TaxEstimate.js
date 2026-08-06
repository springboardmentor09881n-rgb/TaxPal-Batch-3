const mongoose = require('mongoose');

const taxEstimateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    country: {
      type: String,
      required: true,
      trim: true
    },

    region: {
      type: String,
      trim: true,
      default: ''
    },

    taxYear: {
      type: String,
      trim: true,
      default: 'FY 2025-26'
    },

    taxRegime: {
      type: String,
      trim: true,
      default: 'Single'
    },

    filingStatus: {
      type: String,
      trim: true
    },

    quarter: {
      type: String,
      trim: true
    },

    annualGrossIncome: {
      type: Number,
      default: 0
    },

    grossIncome: {
      type: Number,
      default: 0
    },

    deductions: {
      businessExpenses: { type: Number, default: 0 },
      retirementContributions: { type: Number, default: 0 },
      healthInsurance: { type: Number, default: 0 },
      homeOffice: { type: Number, default: 0 }
    },

    taxableIncome: {
      type: Number,
      required: true,
      min: 0
    },

    estimatedAnnualTax: {
      type: Number,
      default: 0,
      min: 0
    },

    estimatedQuarterlyTax: {
      type: Number,
      default: 0,
      min: 0
    },

    estimatedTax: {
      type: Number,
      required: true,
      min: 0
    },

    effectiveTaxRate: {
      type: Number,
      required: true,
      min: 0
    },

    slabBreakdown: [
      {
        label: {
          type: String,
          required: true
        },

        taxableAmount: {
          type: Number,
          required: true,
          min: 0
        },

        rate: {
          type: Number,
          required: true,
          min: 0
        },

        taxAmount: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

taxEstimateSchema.index({
  user: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  'TaxEstimate',
  taxEstimateSchema
);