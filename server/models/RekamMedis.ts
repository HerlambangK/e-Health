import { Schema, model, Document } from "mongoose";

interface ICPPTEntry {
  tanggal: Date;
  petugasId: Schema.Types.ObjectId;
  profesi: "dokter" | "perawat" | "bidan" | "fisioterapi" | "gizi";
  subyektif: string;
  obyektif: string;
  analisis: string;
  plan: string;
}

interface IObjektif {
  ttv?: {
    tekananDarahSistolik?: number;
    tekananDarahDiastolik?: number;
    nadi?: number;
    respirasi?: number;
    suhu?: number;
    spo2?: number;
    beratBadan?: number;
    tinggiBadan?: number;
    lingkarPerut?: number;
    gcs?: number;
  };
  pemeriksaanFisik?: string;
  statusNeurologis?: string;
}

interface IDiagnosisEntry {
  kodeICD10: string;
  namaICD10: string;
  status: "confirmed" | "suspected" | "differential";
  fhirConditionId?: string;
}

export interface IRekamedis extends Document {
  pasienId: Schema.Types.ObjectId;
  encounterId: Schema.Types.ObjectId;
  dokterId: Schema.Types.ObjectId;
  namaPasien: string;
  dokter: string;
  subjektif: {
    keluhanUtama: string;
    keluhan: string;
    riwayatPenyakitSekarang?: string;
    riwayatPenyakitDahulu?: string;
    riwayatKeluarga?: string;
    riwayatAlergi?: string;
    riwayatObat?: string;
  };
  objektif: IObjektif;
  tensiSistol: number;
  tensiDiastol: number;
  guladarah: number;
  diagnosis?: string;
  diagnosisUtama?: IDiagnosisEntry;
  diagnosisLain?: IDiagnosisEntry[];
  plan?: {
    instruksi?: string;
    followUp?: Date;
    kontrolKe?: number;
  };
  kontrolTerakhir: string;
  followUpDate?: string;
  labResults?: Array<{ name: string; value: string; unit?: string }>;
  obat: string[];
  resepObat?: string[];
  catatan: string;
  cppt?: ICPPTEntry[];
  fhirId?: string;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
}

const CPPTEntrySchema = new Schema<ICPPTEntry>(
  {
    tanggal: { type: Date, required: true },
    petugasId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profesi: {
      type: String,
      enum: ["dokter", "perawat", "bidan", "fisioterapi", "gizi"],
      required: true,
    },
    subyektif: { type: String, required: true },
    obyektif: { type: String, required: true },
    analisis: { type: String, required: true },
    plan: { type: String, required: true },
  },
  { _id: false }
);

const rekamedisSchema = new Schema<IRekamedis>(
  {
    pasienId: { type: Schema.Types.ObjectId, ref: "Pasien" },
    encounterId: { type: Schema.Types.ObjectId, ref: "Encounter" },
    dokterId: { type: Schema.Types.ObjectId, ref: "Dokter" },
    namaPasien: { type: Schema.Types.ObjectId, ref: "Pasien" },
    dokter: { type: Schema.Types.ObjectId, ref: "Dokter" },
    subjektif: {
      keluhanUtama: String,
      keluhan: String,
      riwayatPenyakitSekarang: String,
      riwayatPenyakitDahulu: String,
      riwayatKeluarga: String,
      riwayatAlergi: String,
      riwayatObat: String,
    },
    objektif: {
      ttv: {
        tekananDarahSistolik: Number,
        tekananDarahDiastolik: Number,
        nadi: Number,
        respirasi: Number,
        suhu: Number,
        spo2: Number,
        beratBadan: Number,
        tinggiBadan: Number,
        lingkarPerut: Number,
        gcs: Number,
      },
      pemeriksaanFisik: String,
      statusNeurologis: String,
    },
    tensiSistol: { type: Number, required: true },
    tensiDiastol: { type: Number, required: true },
    guladarah: { type: Number, required: true },
    diagnosis: String,
    diagnosisUtama: {
      kodeICD10: String,
      namaICD10: String,
      status: { type: String, enum: ["confirmed", "suspected", "differential"] },
      fhirConditionId: String,
    },
    diagnosisLain: [
      {
        kodeICD10: String,
        namaICD10: String,
        status: { type: String, enum: ["confirmed", "suspected", "differential"] },
        fhirConditionId: String,
      },
    ],
    plan: {
      instruksi: String,
      followUp: Date,
      kontrolKe: Number,
    },
    kontrolTerakhir: { type: String, required: true },
    followUpDate: String,
    labResults: [
      {
        name: { type: String },
        value: { type: String },
        unit: { type: String },
      },
    ],
    obat: { type: [String], required: true },
    resepObat: [{ type: String }],
    catatan: { type: String, required: true },
    cppt: [CPPTEntrySchema],
    fhirId: String,
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<IRekamedis>("Rekamedis", rekamedisSchema);
