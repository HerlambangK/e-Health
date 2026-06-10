import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IAntrian extends Document {
  encounterId: Schema.Types.ObjectId;
  pasienId: Schema.Types.ObjectId;
  poliId: Schema.Types.ObjectId;
  dokterId?: Schema.Types.ObjectId;
  nomorAntrian: string;
  tanggal: Date;
  status: "waiting" | "called" | "in_room" | "done" | "skip";
  estimasiWaktu?: string;
  panggilAt?: Date;
  masukAt?: Date;
  selesaiAt?: Date;
  createdBy: Schema.Types.ObjectId;
}

const AntrianSchema = new Schema<IAntrian>(
  {
    encounterId: {
      type: Schema.Types.ObjectId,
      ref: "Encounter",
      required: true,
    },
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    poliId: { type: Schema.Types.ObjectId, ref: "Poli", required: true },
    dokterId: { type: Schema.Types.ObjectId, ref: "Dokter" },
    nomorAntrian: { type: String, required: true },
    tanggal: { type: Date, required: true },
    status: {
      type: String,
      enum: ["waiting", "called", "in_room", "done", "skip"],
      default: "waiting",
    },
    estimasiWaktu: String,
    panggilAt: Date,
    masukAt: Date,
    selesaiAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AntrianSchema.index({ poliId: 1, tanggal: 1, nomorAntrian: 1 });
AntrianSchema.index({ encounterId: 1 });

export default model<IAntrian>("Antrian", AntrianSchema);
