import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IBed extends Document {
  kode: string;
  nama: string;
  ruang: string;
  kelas: "VVIP" | "VIP" | "Kelas_1" | "Kelas_2" | "Kelas_3" | "ICU" | "NICU" | "PICU" | "HCU";
  status: "available" | "occupied" | "maintenance" | "reserved";
  isActive: boolean;
  tarifPerHari: number;
  fhirLocationId?: string;
}

const BedSchema = new Schema<IBed>(
  {
    kode: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    ruang: { type: String, required: true },
    kelas: {
      type: String,
      enum: ["VVIP", "VIP", "Kelas_1", "Kelas_2", "Kelas_3", "ICU", "NICU", "PICU", "HCU"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
    },
    isActive: { type: Boolean, default: true },
    tarifPerHari: { type: Number, default: 0 },
    fhirLocationId: String,
  },
  { timestamps: true }
);

BedSchema.index({ ruang: 1, status: 1 });

export default model<IBed>("Bed", BedSchema);
