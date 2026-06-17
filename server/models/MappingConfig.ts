import mongoose, { Schema, Document } from "mongoose";

export interface IMappingEntry {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  column: string;
}

export interface IMappingConfig extends Document {
  name: string;
  mappings: IMappingEntry[];
  columnsSnapshot: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MappingEntrySchema = new Schema<IMappingEntry>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    placeholder: { type: String, required: true },
    required: { type: Boolean, default: false },
    column: { type: String, default: "" },
  },
  { _id: false }
);

const MappingConfigSchema = new Schema<IMappingConfig>(
  {
    name: { type: String, required: true },
    mappings: { type: [MappingEntrySchema], default: [] },
    columnsSnapshot: { type: [String], default: [] },
  },
  { timestamps: true }
);

MappingConfigSchema.index({ updatedAt: -1 });

export default mongoose.model<IMappingConfig>("MappingConfig", MappingConfigSchema);
