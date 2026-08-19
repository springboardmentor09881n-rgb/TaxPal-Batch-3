const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    country: {
      type: String,
      required: true,
      trim: true
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },

    address: {
      type: String,
      trim: true,
      default: ''
    },

    avatar: {
      type: String,
      default: ''
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);