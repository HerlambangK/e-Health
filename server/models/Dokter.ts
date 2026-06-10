import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IDokter extends Document {
  namaDokter: string;
  nip: string;
  spesialisasi: string;
  poli: string;
  poliId?: Schema.Types.ObjectId;
  jadwal: string;
  kehadiran: string;
  licenseNumber?: string;
  sip?: string;
  yearsExperience?: number;
  signatureUrl?: string;
  telepon?: string;
  email?: string;
  tarifKonsultasi?: number;
  billingCode?: string;
  appointmentSlots?: string[];
  catatan?: string;
  fhirId?: string;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
}

const dokterSchema = new Schema<IDokter>(
  {
    namaDokter: { type: String, required: true },
    nip: { type: String, required: true },
    spesialisasi: { type: String, required: true },
    poli: { type: String, required: true },
    poliId: { type: Schema.Types.ObjectId, ref: "Poli" },
    jadwal: { type: String, required: true },
    kehadiran: { type: String, required: true },
    licenseNumber: String,
    sip: String,
    yearsExperience: Number,
    signatureUrl: String,
    telepon: String,
    email: String,
    tarifKonsultasi: Number,
    billingCode: String,
    appointmentSlots: [{ type: String }],
    catatan: String,
    fhirId: String,
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<IDokter>("Dokter", dokterSchema);
