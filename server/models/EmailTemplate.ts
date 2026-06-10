import mongoose, { Schema, Document } from "mongoose";

export interface IEmailTemplate extends Document {
  templateId: string;
  name: string;
  subject: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    templateId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema);
