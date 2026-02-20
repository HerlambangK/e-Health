import { Schema, model, Document } from "mongoose";
import { generateHash } from "../utils/hash";
import bcrypt from "bcryptjs";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  role: string;
  isActive: boolean;
  patientId?: Schema.Types.ObjectId;
  lastLogin: Date;

  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    isAdmin: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["admin", "doctor", "nurse", "receptionist", "billing", "patient"],
      default: "patient",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Pasien" },
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

userSchema.index({ role: 1, isActive: 1 });

export const User = model<UserDocument>("User", userSchema);
