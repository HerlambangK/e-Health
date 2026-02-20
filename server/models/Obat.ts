import { Schema, model, Document } from "mongoose";

interface IObat extends Document {
  nama: string;
  dosis?: string;
  keterangan?: string;
}

const obatSchema = new Schema<IObat>(
  {
    nama: { type: String, required: true },
    dosis: { type: String },
    keterangan: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model<IObat>("Obat", obatSchema);
