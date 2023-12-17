import { Schema, model, Document } from "mongoose";
import { generateHash } from "../utils/hash";
import bcrypt from "bcryptjs";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  lastLogin: Date;

  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    isAdmin: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await generateHash(this.password);

  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const User = model<UserDocument>("User", userSchema);
