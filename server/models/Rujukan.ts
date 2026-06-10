import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IRujukan extends Document {
  noRujukan: string;
  encounterId: Schema.Types.ObjectId;
  pasienId: Schema.Types.ObjectId;
  tipe: "masuk" | "keluar" | "internal";
  dariFaskes?: string;
  dariFaskesKode?: string;
  dariDokter?: string;
  tujuanFaskes?: string;
  tujuanFaskesKode?: string;
  tujuanSpesialis?: string;
  poliTujuan?: Schema.Types.ObjectId;
  diagnosisRujukan: string;
  alasanRujukan: string;
  ringkasanKlinis?: string;
  obatDibawa?: string[];
  noSuratRujukan?: string;
  tanggalRujukan: Date;
  tanggalBerlaku?: Date;
  status: "active" | "completed" | "cancelled";
  noBPJS?: string;
  noSJP?: string;
  fhirId?: string;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
  createdBy: Schema.Types.ObjectId;
}

const RujukanSchema = new Schema<IRujukan>(
  {
    noRujukan: { type: String, unique: true, required: true },
    encounterId: { type: Schema.Types.ObjectId, ref: "Encounter", required: true },
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    tipe: { type: String, enum: ["masuk", "keluar", "internal"], required: true },
    dariFaskes: String,
    dariFaskesKode: String,
    dariDokter: String,
    tujuanFaskes: String,
    tujuanFaskesKode: String,
    tujuanSpesialis: String,
    poliTujuan: { type: Schema.Types.ObjectId, ref: "Poli" },
    diagnosisRujukan: { type: String, required: true },
    alasanRujukan: { type: String, required: true },
    ringkasanKlinis: String,
    obatDibawa: [{ type: String }],
    noSuratRujukan: String,
    tanggalRujukan: { type: Date, required: true },
    tanggalBerlaku: Date,
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    noBPJS: String,
    noSJP: String,
    fhirId: String,
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

RujukanSchema.index({ pasienId: 1, status: 1 });

export default model<IRujukan>("Rujukan", RujukanSchema);
