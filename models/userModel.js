const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "FIRST_NAME_REQUIRED"],
    trim: true,
    min: [3, "FIRST_NAME_TOO_SHORT"],
  },
  lastName: {
    type: String,
    required: [true, "FIRST_NAME_REQUIRED"],
    trim: true,
    min: [3, "FIRST_NAME_TOO_SHORT"],
  },

  role: {
    type: String,
    enum: ["user", "admin"],
  },

  email: {
    type: String,
    trim: true,
    required: [true, "EMAIL_REQUIRED"],
  },

  password: {
    type: String,
    trim: true,
    required: [true, "PASSWORD_REQUIRED"],
  },
});

module.exports = mongoose.Model("User", userSchema);
