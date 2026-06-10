import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IDiagnosis extends Document {
  encounterId: Schema.Types.ObjectId;
  pasienId: Schema.Types.ObjectId;
  diagnosisUtama: {
    kodeICD10: string;
    namaICD10: string;
    status: "confirmed" | "suspected" | "differential";
    fhirConditionId?: string;
  };
  diagnosisLain: Array<{
    kodeICD10: string;
    namaICD10: string;
    status: "confirmed" | "suspected" | "differential";
    fhirConditionId?: string;
  }>;
  createdBy: Schema.Types.ObjectId;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
  fhirId?: string;
}

const DiagnosisSchema = new Schema<IDiagnosis>(
  {
    encounterId: {
      type: Schema.Types.ObjectId,
      ref: "Encounter",
      required: true,
      unique: true,
    },
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    diagnosisUtama: {
      kodeICD10: { type: String, required: true },
      namaICD10: { type: String, required: true },
      status: {
        type: String,
        enum: ["confirmed", "suspected", "differential"],
        default: "confirmed",
      },
      fhirConditionId: String,
    },
    diagnosisLain: [
      {
        kodeICD10: { type: String, required: true },
        namaICD10: { type: String, required: true },
        status: {
          type: String,
          enum: ["confirmed", "suspected", "differential"],
          default: "suspected",
        },
        fhirConditionId: String,
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
    fhirId: String,
  },
  { timestamps: true }
);

export default model<IDiagnosis>("Diagnosis", DiagnosisSchema);
