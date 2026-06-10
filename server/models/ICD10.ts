import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IICD10 extends Document {
  code: string;
  display_id: string;
  display_en: string;
  chapter: string;
  category: string;
  parent?: string;
  level: 1 | 2 | 3;
  searchText: string;
  isActive: boolean;
}

const ICD10Schema = new Schema<IICD10>(
  {
    code: { type: String, unique: true, required: true, index: true },
    display_id: { type: String, required: true },
    display_en: { type: String, required: true },
    chapter: { type: String, required: true },
    category: String,
    parent: String,
    level: { type: Number, enum: [1, 2, 3] },
    searchText: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ICD10Schema.index({ searchText: "text", display_id: "text", code: "text" });
ICD10Schema.index({ category: 1 });

export default model<IICD10>("ICD10", ICD10Schema);
