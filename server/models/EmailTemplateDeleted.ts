import mongoose, { Schema, Document } from "mongoose";

export interface IEmailTemplateDeleted extends Document {
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateDeletedSchema = new Schema<IEmailTemplateDeleted>(
  {
    templateId: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEmailTemplateDeleted>(
  "EmailTemplateDeleted",
  EmailTemplateDeletedSchema
);
