const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "NAME_REQUIRED"],
      trim: true,
      minlength: [3, "NAME_TOO_SHORT"],
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
      minlength: [8, "PASSWORD_TOO_SHORT"],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(
            value,
          );
        },
        message: "PASSWORD_NOT_STRONG_ENOUGH",
      },
    },

    active: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    passwordChangedAt: { type: Date, select: false },
    passwordResetOTP: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordResetVerified: {
      type: Boolean,
      default: false,
      select: false,
    },

    emailVerificationOTP: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
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
    hashedOTP === this.passwordResetOTP &&
    this.passwordResetExpires > Date.now()
  );
};

// generate email verification code
userSchema.methods.createEmailVerificationOtp = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.emailVerificationOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.verifyEmailVerification = function (otp) {
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  return (
    hashedOTP === this.emailVerificationOTP &&
    this.emailVerificationExpires > Date.now()
  );
};

module.exports = mongoose.model("User", userSchema);
