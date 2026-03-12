// src/models/user.model.ts

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "./interfaces/user.interface.js";

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name must be at most 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,   // normalised before save
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // select: false — excluded from normal queries; we fetch it explicitly only
      // in AuthService.login() where we need to compare it.
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ── Pre-save: hash password only when it has been modified ────────────────────
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

// ── Index ─────────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model<IUser>("User", UserSchema);
export default User;