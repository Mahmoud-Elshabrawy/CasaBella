const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "FIRST_NAME_REQUIRED"],
      trim: true,
      minlength: [3, "FIRST_NAME_TOO_SHORT"],
    },
    lastName: {
      type: String,
      required: [true, "LAST_NAME_REQUIRED"],
      trim: true,
      minlength: [3, "LAST_NAME_TOO_SHORT"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    email: {
      type: String,
      trim: true,
      required: [true, "EMAIL_REQUIRED"],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "PASSWORD_REQUIRED"],
      select: false,
    },

    passwordChangedAt: Date,
    passwordResetOTP: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

// hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
});

// compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// generate password reset code
userSchema.methods.createPasswordResetOTP = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.verifyResetPassword = function (otp) {
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  return (
    hashedOTP === this.passwordResetOTP && this.passwordResetExpires > Date.now()
  );
};



module.exports = mongoose.model("User", userSchema);
