import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IPoli extends Document {
  nama: string;
  kode: string;
  deskripsi?: string;
  lokasi?: string;
  warna?: string;
  icon?: string;
  fhirLocationId?: string;
  isActive: boolean;
}

const poliSchema = new Schema<IPoli>(
  {
    nama: { type: String, required: true },
    kode: { type: String, required: true, unique: true },
    deskripsi: String,
    lokasi: String,
    warna: String,
    icon: String,
    fhirLocationId: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IPoli>("Poli", poliSchema);
