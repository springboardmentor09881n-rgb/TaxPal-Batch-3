const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['tax', 'budget', 'system'],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    alertDate: { type: Date, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

alertSchema.index({ userId: 1, type: 1, message: 1, alertDate: 1 }, { unique: true });

module.exports = mongoose.model('Alert', alertSchema);
