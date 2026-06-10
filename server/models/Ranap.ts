import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface IRanap extends Document {
  noRanap: string;
  pasienId: Schema.Types.ObjectId;
  encounterId: Schema.Types.ObjectId;
  dpjpId: Schema.Types.ObjectId;
  dokterKonsulId?: Schema.Types.ObjectId[];
  tanggalMasuk: Date;
  tanggalKeluar?: Date;
  bedId: Schema.Types.ObjectId;
  ruangan: string;
  noKamar: string;
  noBed: string;
  kelasRawat: "VIP" | "I" | "II" | "III" | "HCU" | "ICU" | "PICU" | "NICU";
  diagnosisMasuk: string;
  diagnosisKeluar?: string;
  kondisiKeluar?: "sembuh" | "membaik" | "belum_sembuh" | "meninggal" | "pulang_paksa" | "dirujuk";
  instruksiDpjp?: string;
  instruksiPulang?: string;
  jenisPembayaran: string;
  noSEP?: string;
  losHari?: number;
  status: "active" | "discharged" | "transferred" | "deceased";
  fhirEncounterId?: string;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
  createdBy: Schema.Types.ObjectId;
}

const RanapSchema = new Schema<IRanap>(
  {
    noRanap: { type: String, unique: true, required: true },
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    encounterId: { type: Schema.Types.ObjectId, ref: "Encounter", required: true },
    dpjpId: { type: Schema.Types.ObjectId, ref: "Dokter", required: true },
    dokterKonsulId: [{ type: Schema.Types.ObjectId, ref: "Dokter" }],
    tanggalMasuk: { type: Date, required: true },
    tanggalKeluar: Date,
    bedId: { type: Schema.Types.ObjectId, ref: "Bed", required: true },
    ruangan: { type: String, required: true },
    noKamar: { type: String, required: true },
    noBed: { type: String, required: true },
    kelasRawat: {
      type: String,
      enum: ["VIP", "I", "II", "III", "HCU", "ICU", "PICU", "NICU"],
      required: true,
    },
    diagnosisMasuk: { type: String, required: true },
    diagnosisKeluar: String,
    kondisiKeluar: {
      type: String,
      enum: ["sembuh", "membaik", "belum_sembuh", "meninggal", "pulang_paksa", "dirujuk"],
    },
    instruksiDpjp: String,
    instruksiPulang: String,
    jenisPembayaran: { type: String, required: true },
    noSEP: String,
    losHari: Number,
    status: {
      type: String,
      enum: ["active", "discharged", "transferred", "deceased"],
      default: "active",
    },
    fhirEncounterId: String,
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

RanapSchema.index({ bedId: 1, status: 1 });
RanapSchema.index({ pasienId: 1, status: 1 });

export default model<IRanap>("Ranap", RanapSchema);
