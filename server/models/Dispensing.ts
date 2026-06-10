import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IDispensingItem {
  resepItemIndex: number;
  obatId: Schema.Types.ObjectId;
  namaObat: string;
  jumlahDiberikan: number;
  noBatch: string;
  expiredDate?: Date;
  golongan: string;
}

export interface IDispensing extends Document {
  resepId: Schema.Types.ObjectId;
  encounterId: Schema.Types.ObjectId;
  pasienId: Schema.Types.ObjectId;
  apotekerId: Schema.Types.ObjectId;
  items: IDispensingItem[];
  waktuDispensing: Date;
  catatan?: string;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
}

const DispensingItemSchema = new Schema<IDispensingItem>(
  {
    resepItemIndex: { type: Number, required: true },
    obatId: { type: Schema.Types.ObjectId, ref: "Obat", required: true },
    namaObat: { type: String, required: true },
    jumlahDiberikan: { type: Number, required: true },
    noBatch: { type: String, required: true },
    expiredDate: Date,
    golongan: { type: String, required: true },
  },
  { _id: false }
);

const DispensingSchema = new Schema<IDispensing>(
  {
    resepId: { type: Schema.Types.ObjectId, ref: "Resep", required: true },
    encounterId: {
      type: Schema.Types.ObjectId,
      ref: "Encounter",
      required: true,
    },
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    apotekerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [DispensingItemSchema], required: true },
    waktuDispensing: { type: Date, required: true },
    catatan: String,
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<IDispensing>("Dispensing", DispensingSchema);
