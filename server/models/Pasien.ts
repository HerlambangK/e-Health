import { Schema, model, Document } from "mongoose";

interface IPasien extends Document {
  nama: string;
  umur: number;
  address: string;
  notlp: string;
  dokter: string; // ID dokter yang berelasi
  poli: string; // Nama poli yang berelasi
  jenisAsuransi: string;
  rekamedis: string; // ID rekamedis yang berelasi
  foto_profil: string;
  riwayatPenyakit?: string[];
  completedStatus: boolean;
}

const pasienSchema = new Schema<IPasien>(
  {
    nama: { type: String, required: true },
    umur: { type: Number, required: true },
    address: { type: String, required: true },
    notlp: { type: String, required: true },
    dokter: { type: Schema.Types.ObjectId, ref: "Dokter" },
    poli: { type: String },
    // poli: { type: String, ref: "Dokter.poli" },
    jenisAsuransi: { type: String, required: true },
    rekamedis: { type: Schema.Types.ObjectId, ref: "Rekamedis" },
    // rekamedis: { type: String },
    foto_profil: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
    },
    riwayatPenyakit: [{ type: String }],
    completedStatus: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default model<IPasien>("Pasien", pasienSchema);
