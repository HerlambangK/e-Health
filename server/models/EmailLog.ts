import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmailLog extends Document {
  campaignId: Types.ObjectId;
  recipientEmail: string;
  recipientName: string;
  recipientData: Record<string, any>;
  subject: string;
  body: string;
  status: "sent" | "failed" | "skipped";
  error: string | null;
  sentAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "EmailCampaign", required: true, index: true },
    recipientEmail: { type: String, required: true },
    recipientName: { type: String, default: "" },
    recipientData: { type: Schema.Types.Mixed, default: {} },
    subject: { type: String, default: "" },
    body: { type: String, default: "" },
    status: {
      type: String,
      enum: ["sent", "failed", "skipped"],
      required: true,
    },
    error: { type: String, default: null },
    sentAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

EmailLogSchema.index({ campaignId: 1, status: 1 });
EmailLogSchema.index({ recipientEmail: 1 });

export default mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);
