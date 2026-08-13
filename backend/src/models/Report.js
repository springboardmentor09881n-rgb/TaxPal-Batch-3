const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    period: {
      type: String,
      required: true
    },
    format: {
      type: String,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);
