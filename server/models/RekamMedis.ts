import { Schema, model, Document } from "mongoose";

interface IRekamedis extends Document {
  namaPasien: string;
  dokter: string; // ID dokter yang berelasi
  keluhan: string;
  diagnosis?: string;
  tensiSistol: number;
  tensiDiastol: number;
  guladarah: number;
  kontrolTerakhir: string;
  followUpDate?: string;
  labResults?: Array<{ name: string; value: string; unit?: string }>;
  obat: string[];
  catatan: string;
}

const rekamedisSchema = new Schema<IRekamedis>(
  {
    namaPasien: { type: Schema.Types.ObjectId, ref: "Pasien" },
    dokter: { type: Schema.Types.ObjectId, ref: "Dokter" },
    keluhan: { type: String, required: true },
    diagnosis: { type: String },
    tensiSistol: { type: Number, required: true },
    tensiDiastol: { type: Number, required: true },
    guladarah: { type: Number, required: true },
    kontrolTerakhir: { type: String, required: true },
    followUpDate: { type: String },
    labResults: [
      {
        name: { type: String },
        value: { type: String },
        unit: { type: String },
      },
    ],
    obat: { type: [String], required: true },
    catatan: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model<IRekamedis>("Rekamedis", rekamedisSchema);
