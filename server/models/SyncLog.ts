import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface ISyncLog extends Document {
  sistem: "satusehat" | "sinoap" | "bpjs" | "dukcapil";
  resource: string;
  resourceId: string;
  fhirResource?: string;
  action: "create" | "update" | "delete";
  status: "pending" | "processing" | "success" | "failed";
  httpStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  completedAt?: Date;
}

const SyncLogSchema = new Schema<ISyncLog>(
  {
    sistem: {
      type: String,
      enum: ["satusehat", "sinoap", "bpjs", "dukcapil"],
      required: true,
    },
    resource: { type: String, required: true },
    resourceId: { type: String, required: true },
    fhirResource: String,
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed"],
      default: "pending",
    },
    httpStatus: Number,
    responseBody: String,
    errorMessage: String,
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 5 },
    nextRetryAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

SyncLogSchema.index({ sistem: 1, status: 1, nextRetryAt: 1 });
SyncLogSchema.index({ resource: 1, resourceId: 1 });

export default model<ISyncLog>("SyncLog", SyncLogSchema);
