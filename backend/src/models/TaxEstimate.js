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
      required: true,
      trim: true
    },

    taxRegime: {
      type: String,
      required: true,
      trim: true
    },

    taxableIncome: {
      type: Number,
      required: true,
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