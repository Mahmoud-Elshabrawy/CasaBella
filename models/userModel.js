const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
  },
  { timestamps: true },
);

// hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});


// compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

module.exports = mongoose.model("User", userSchema);
