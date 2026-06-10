import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IICD9CM extends Document {
  code: string;
  display_id: string;
  display_en: string;
  category: string;
  searchText: string;
  isActive: boolean;
}

const ICD9CMSchema = new Schema<IICD9CM>(
  {
    code: { type: String, unique: true, required: true, index: true },
    display_id: { type: String, required: true },
    display_en: String,
    category: String,
    searchText: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ICD9CMSchema.index({ searchText: "text", display_id: "text", code: "text" });

export default model<IICD9CM>("ICD9CM", ICD9CMSchema);
