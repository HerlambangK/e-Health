import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IEncounter extends Document {
  noEncounter: string;
  pasienId: Schema.Types.ObjectId;
  dokterId?: Schema.Types.ObjectId;
  poliId: Schema.Types.ObjectId;
  tipe: "outpatient" | "inpatient" | "emergency" | "home_visit";
  status:
    | "planned"
    | "arrived"
    | "triaged"
    | "in-progress"
    | "onleave"
    | "finished"
    | "cancelled";
  tanggalMulai: Date;
  tanggalSelesai?: Date;
  jenisPembayaran: "BPJS" | "umum" | "asuransi" | "gratis";
  noBPJS?: string;
  noSEP?: string;
  noAsuransi?: string;
  appointmentId?: Schema.Types.ObjectId;
  rujukanId?: Schema.Types.ObjectId;
  ranapId?: Schema.Types.ObjectId;
  keluhanUtama?: string;
  anamnesis?: string;
  fhirId?: string;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
  fhirSyncAt?: Date;
  fhirSyncError?: string;
  fhirSyncRetry: number;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const EncounterSchema = new Schema<IEncounter>(
  {
    noEncounter: { type: String, unique: true, required: true },
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    dokterId: { type: Schema.Types.ObjectId, ref: "Dokter" },
    poliId: { type: Schema.Types.ObjectId, ref: "Poli", required: true },
    tipe: {
      type: String,
      enum: ["outpatient", "inpatient", "emergency", "home_visit"],
      default: "outpatient",
    },
    status: {
      type: String,
      enum: [
        "planned",
        "arrived",
        "triaged",
        "in-progress",
        "onleave",
        "finished",
        "cancelled",
      ],
      default: "planned",
    },
    tanggalMulai: { type: Date, required: true },
    tanggalSelesai: Date,
    jenisPembayaran: {
      type: String,
      enum: ["BPJS", "umum", "asuransi", "gratis"],
      default: "umum",
    },
    noBPJS: String,
    noSEP: String,
    noAsuransi: String,
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    rujukanId: { type: Schema.Types.ObjectId, ref: "Rujukan" },
    ranapId: { type: Schema.Types.ObjectId, ref: "Ranap" },
    keluhanUtama: String,
    anamnesis: String,
    fhirId: String,
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
    fhirSyncAt: Date,
    fhirSyncError: String,
    fhirSyncRetry: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EncounterSchema.index({ pasienId: 1, tanggalMulai: -1 });
EncounterSchema.index({ poliId: 1, tanggalMulai: 1, status: 1 });
EncounterSchema.index({ fhirSyncStatus: 1 });

export default model<IEncounter>("Encounter", EncounterSchema);
