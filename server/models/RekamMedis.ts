import { Schema, model, Document } from "mongoose";

interface IRekamedis extends Document {
  namaPasien: string;
  dokter: string; // ID dokter yang berelasi
  keluhan: string;
  tensiSistol: number;
  tensiDiastol: number;
  guladarah: number;
  kontrolTerakhir: string;
  obat: string[];
  catatan: string;
}

const rekamedisSchema = new Schema<IRekamedis>({
  namaPasien: { type: Schema.Types.ObjectId, ref: "Pasien" },
  dokter: { type: Schema.Types.ObjectId, ref: "Dokter" },
  keluhan: { type: String, required: true },
  tensiSistol: { type: Number, required: true },
  tensiDiastol: { type: Number, required: true },
  guladarah: { type: Number, required: true },
  kontrolTerakhir: { type: String, required: true },
  obat: { type: [String], required: true },
  catatan: { type: String, required: true },
});

export default model<IRekamedis>("Rekamedis", rekamedisSchema);
