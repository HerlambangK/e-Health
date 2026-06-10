import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface ITindakan extends Document {
  encounterId: Schema.Types.ObjectId;
  pasienId: Schema.Types.ObjectId;
  dokterId: Schema.Types.ObjectId;
  kodeICD9CM: string;
  namaICD9CM: string;
  waktu: Date;
  catatan?: string;
  createdBy: Schema.Types.ObjectId;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
  fhirProcedureId?: string;
}

const TindakanSchema = new Schema<ITindakan>(
  {
    encounterId: {
      type: Schema.Types.ObjectId,
      ref: "Encounter",
      required: true,
    },
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    dokterId: { type: Schema.Types.ObjectId, ref: "Dokter", required: true },
    kodeICD9CM: { type: String, required: true },
    namaICD9CM: { type: String, required: true },
    waktu: { type: Date, required: true },
    catatan: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
    fhirProcedureId: String,
  },
  { timestamps: true }
);

TindakanSchema.index({ encounterId: 1 });

export default model<ITindakan>("Tindakan", TindakanSchema);
