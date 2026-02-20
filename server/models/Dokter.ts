import { Schema, model } from "mongoose";
import type { Document } from "mongoose";
interface IDokter extends Document {
  namaDokter: string;
  nip: string;
  spesialisasi: string;
  poli: string;
  jadwal: string;
  kehadiran: string;
  licenseNumber?: string;
  yearsExperience?: number;
  signatureUrl?: string;
  telepon?: string;
  email?: string;
  tarifKonsultasi?: number;
  billingCode?: string;
  appointmentSlots?: string[];
  catatan?: string;
}

const dokterSchema = new Schema(
  {
    namaDokter: { type: String, required: true },
    nip: { type: String, required: true },
    spesialisasi: { type: String, required: true },
    poli: { type: String, required: true },
    jadwal: { type: String, required: true },
    kehadiran: { type: String, required: true },
    licenseNumber: { type: String },
    yearsExperience: { type: Number },
    signatureUrl: { type: String },
    telepon: { type: String },
    email: { type: String },
    tarifKonsultasi: { type: Number },
    billingCode: { type: String },
    appointmentSlots: [{ type: String }],
    catatan: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model<IDokter>("Dokter", dokterSchema);
// export const Dokter = model<IDokter>("Dokter", dokterSchema);
