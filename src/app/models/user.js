const mongoose = require("../../database");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    unique: true
  },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  password: { type: String, required: true, select: false },
  course: { type: String },
  profilePicture: String,
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", async function(next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
