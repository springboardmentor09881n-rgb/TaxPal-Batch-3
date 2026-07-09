const mongoose = require('mongoose');

const suggestedCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    description: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

suggestedCategorySchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('SuggestedCategory', suggestedCategorySchema);
