import mongoose, { Schema, Document } from "mongoose";

export interface IEmailCampaign extends Document {
  name: string;
  templateSubject: string;
  templateBody: string;
  from: string;
  testEmail?: string;
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  nextIndex: number;
  status: "running" | "done" | "cancelled";
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema = new Schema<IEmailCampaign>(
  {
    name: { type: String, required: true },
    templateSubject: { type: String, default: "" },
    templateBody: { type: String, required: true },
    from: { type: String, required: true },
    testEmail: String,
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    nextIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["running", "done", "cancelled"],
      default: "running",
    },
    completedAt: Date,
  },
  { timestamps: true }
);

EmailCampaignSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IEmailCampaign>("EmailCampaign", EmailCampaignSchema);
