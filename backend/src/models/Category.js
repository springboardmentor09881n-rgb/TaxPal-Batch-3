const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },

    description: {
      type: String,
      trim: true,
      default: ''
    },

    isDefault: {
      type: Boolean,
      default: false
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate category names for the same user and type
categorySchema.index(
  {
    user: 1,
    name: 1,
    type: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  'Category',
  categorySchema
);