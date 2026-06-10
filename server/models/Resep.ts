import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IResepItem {
  obatId: Schema.Types.ObjectId;
  namaObat: string;
  kodeObat: string;
  kfaCode?: string;
  bentukSediaan: string;
  kekuatan: string;
  dosis: string;
  rute:
    | "oral"
    | "iv"
    | "im"
    | "sc"
    | "topical"
    | "inhalasi"
    | "sublingual"
    | "rektal"
    | "tetes_mata"
    | "tetes_telinga";
  durasi?: number;
  jumlah: number;
  satuan: string;
  instruksi?: string;
  golongan:
    | "antibiotik"
    | "analgesic"
    | "antihipertensi"
    | "antidiabetik"
    | "bronkodilator"
    | "narkotika"
    | "psikotropika"
    | "lainnya";
  fhirMedicationRequestId?: string;
}

export interface IResep extends Document {
  noResep: string;
  encounterId: Schema.Types.ObjectId;
  pasienId: Schema.Types.ObjectId;
  dokterId: Schema.Types.ObjectId;
  tanggalResep: Date;
  items: IResepItem[];
  status: "draft" | "active" | "on_hold" | "cancelled" | "completed" | "dispensed";
  catatan?: string;
  mengandungNarkotika: boolean;
  mengandungPsikotropika: boolean;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
  createdBy: Schema.Types.ObjectId;
}

const ResepItemSchema = new Schema<IResepItem>(
  {
    obatId: { type: Schema.Types.ObjectId, ref: "Obat", required: true },
    namaObat: { type: String, required: true },
    kodeObat: { type: String, required: true },
    kfaCode: String,
    bentukSediaan: { type: String, required: true },
    kekuatan: { type: String, required: true },
    dosis: { type: String, required: true },
    rute: {
      type: String,
      enum: [
        "oral", "iv", "im", "sc", "topical", "inhalasi",
        "sublingual", "rektal", "tetes_mata", "tetes_telinga",
      ],
      required: true,
    },
    durasi: Number,
    jumlah: { type: Number, required: true },
    satuan: { type: String, required: true },
    instruksi: String,
    golongan: {
      type: String,
      enum: [
        "antibiotik", "analgesic", "antihipertensi", "antidiabetik",
        "bronkodilator", "narkotika", "psikotropika", "lainnya",
      ],
      required: true,
    },
    fhirMedicationRequestId: String,
  },
  { _id: false }
);

const ResepSchema = new Schema<IResep>(
  {
    noResep: { type: String, unique: true, required: true },
    encounterId: {
      type: Schema.Types.ObjectId,
      ref: "Encounter",
      required: true,
    },
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    dokterId: { type: Schema.Types.ObjectId, ref: "Dokter", required: true },
    tanggalResep: { type: Date, required: true },
    items: { type: [ResepItemSchema], required: true },
    status: {
      type: String,
      enum: ["draft", "active", "on_hold", "cancelled", "completed", "dispensed"],
      default: "active",
    },
    catatan: String,
    mengandungNarkotika: { type: Boolean, default: false },
    mengandungPsikotropika: { type: Boolean, default: false },
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ResepSchema.index({ encounterId: 1 });
ResepSchema.index({ status: 1 });

export default model<IResep>("Resep", ResepSchema);
