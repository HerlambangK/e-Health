import { Schema, model, Document } from "mongoose";

interface IPenyakit extends Document {
  nama: string;
  gejala?: string[];
  deskripsi?: string;
}

const penyakitSchema = new Schema<IPenyakit>(
  {
    nama: { type: String, required: true },
    gejala: [{ type: String }],
    deskripsi: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model<IPenyakit>("Penyakit", penyakitSchema);
